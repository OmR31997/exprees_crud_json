import express from 'express';
import path from 'path';
import fs from 'fs';

import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import { Builder } from 'xml2js';

import { readDB } from '../Controller/StudentController.js';

const router = express.Router();

/**
 * @route   GET /json
 * @desc    Export student data as JSON file
 */
router.get('/json', async (req, res) => {
    const data = await readDB();
    res.setHeader('Content-Disposition', 'attachment; filename=StudentData.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
});

/**
 * @route   GET /csv
 * @desc    Export student data as CSV file
 */
router.get('/csv', async (req, res) => {
    const data = await readDB();
    const parser = new Parser(); // json2csv Parser
    const csv = parser.parse(data);
    res.setHeader('Content-Disposition', 'attachment; filename=StudentData.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
});

/**
 * @route   GET /xml
 * @desc    Export student data as XML file
 */
router.get('/xml', async (req, res) => {
    const data = await readDB();
    const builder = new Builder(); // xml2js Builder
    const xml = builder.buildObject({ student: data });
    res.setHeader('Content-Disposition', 'attachment; filename=StudentData.xml');
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
});

/**
 * @route   GET /excel
 * @desc    Export student data as Excel file with images
 */
router.get('/excel', async (req, res) => {
    const data = await readDB();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    // Define Excel Columns
    worksheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Course', key: 'course', width: 15 },
        { header: 'Mobile', key: 'mno', width: 15 },
        { header: 'DOB', key: 'dobDate', width: 15 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Face Image', key: 'profilePic', width: 30 },
        { header: 'Sign Image', key: 'signature', width: 30 },
    ];

    data.forEach((student) => {
        const row = worksheet.addRow({
            name: student.name,
            email: student.email,
            course: student.course,
            mno: student.mno,
            dobDate: student.dobDate,
            address: student.address,
            profilePic: 'FaceImage',
            signature: 'SignImage',
        });

        const rowNumber = row.number;

        // Add Face Image if exists
        const facePath = path.join('public', 'uploads', student.profilePic);
        if (fs.existsSync(facePath)) {
            const faceImageId = workbook.addImage({
                filename: facePath,
                extension: path.extname(facePath).replace('.', '')
            });

            worksheet.addImage(faceImageId, {
                tl: { col: 6, row: rowNumber - 1 }, // 7th col
                ext: { width: 60, height: 60 }
            });
        }

        // Add Signature Image if exists
        const signPath = path.join('public', 'uploads', student.signature);
        if (fs.existsSync(signPath)) {
            const signImageId = workbook.addImage({
                filename: signPath,
                extension: path.extname(facePath).replace('.', '')
            });

            worksheet.addImage(signImageId, {
                tl: { col: 7, row: rowNumber - 1 }, // 8th col
                ext: { width: 60, height: 60 }
            });
        }

        worksheet.getRow(rowNumber).height = 60; // Increase row height for images
    });

    res.setHeader('Content-Disposition', 'attachment; filename=StudentData.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    await workbook.xlsx.write(res);
    res.end();
});

/**
 * @route   GET /pdf
 * @desc    Export student data as PDF file (with profile pic)
 */
router.get('/pdf', async (req, res) => {
    const data = await readDB();

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Disposition', 'attachment; filename=StudentData.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    data.forEach((student, index) => {
        doc
            .fontSize(14)
            .text(`Name: ${student.name}`)
            .text(`Email: ${student.email}`)
            .text(`Course: ${student.course}`)
            .text(`Mobile: ${student.mno}`)
            .text(`DOB: ${student.dobDate}`)
            .text(`Address: ${student.address}`)
            .moveDown(0.5);

        // Add profile image if exists
        const imagePath = path.join('public', 'uploads', student.profilePic);
        if (fs.existsSync(imagePath)) {
            doc.image(imagePath, { width: 100 });
        }

        doc.moveDown(1);

        // Add new page except for the last entry
        if (index !== data.length - 1)
            doc.addPage();
    });

    doc.end();
});

/**
 * @route   GET /plainText
 * @desc    Export student data as plain .txt file
 */
router.get('/plainText', async (req, res) => {
    const data = await readDB();

    let content = '';
    data.forEach((student) => {
        content += `Name: ${student.name}\n`;
        content += `Course: ${student.course}\n`;
        content += `Email: ${student.email}\n`;
        content += `Mobile: ${student.mno}\n\n`;
    });

    res.setHeader('Content-Disposition', 'attachment; filename=StudentData.txt');
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
});

export default router;
