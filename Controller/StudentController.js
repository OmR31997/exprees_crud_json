import { validationResult } from 'express-validator';
import path from "path";
import fs from 'fs/promises';
import fsOld from 'fs';
import { fileURLToPath } from "url";
import { v4 as uuid4V } from 'uuid';

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);

const DB_PATH = path.join(__dirName, '../DBDirectory/StudentDB.json')
const rootDir = path.resolve(__dirName, '..');

export const readDB = async () => {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

const writeDB = async (data) => {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export const createStudent = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const students = await readDB();

    const newStudent = {
      id: uuid4V(),
      name: req.body.name,
      email: req.body.email,
      course: req.body.course,
      mno: req.body.mno,
      dobDate: req.body.dobDate,
      address: req.body.address,
      profilePic: req.files?.profilePic?.[0]?.filename || null,
      signature: req.files?.signature?.[0]?.filename || null,
      sheetCopy: req.files?.sheetCopy?.[0]?.filename || null
    }

    students.push(newStudent);
    await writeDB(students);

    res.status(200).type('text').send('Successfully Registered');
  } catch (error) {
    res.status(500).type('text').send(error)
  }
}

export const getStudents = async (req, res) => {
  try {
    const students = await readDB();

    if (students.length <= 0) {
      return res.status(404).json({ error: 'No-one Student' });
    }

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
}

export const getStudent = async (req, res) => {
  try {
    const { name, email } = req.body;

    const students = await readDB();

    const matched = students.filter(student => student.name === name && student.email === email)

    if (matched.length === 0) {
      return res.status(404).type('text').send('Student not found');
    }

    const s = matched[0]; // matched student

    const rollNo = `${s.name.substring(0, 2).toUpperCase()}${s.dobDate.substring(2, 4)}${s.mno.slice(-2)}`;

    res.status(200).type('text').send(rollNo);

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message })
  }
}

export const resultSet = async (req, res) => {
  try {
    const students = await readDB();
    const rollNo = req.params.rollNo;
    const resultData = req.body.result;

    if (!rollNo) {
      return res.status(400).type('text').send('Roll No. Must Be Required');
    }

    let studentFound = false;

    const updatedStudents = students.map(student => {
      const generatedRoll = `${student.name.substring(0, 2).toUpperCase()}${student.dobDate.substring(2, 4)}${student.mno.slice(-2)}`;

      if (generatedRoll === rollNo && student.name === resultData.name) {
        student.result = resultData; // ✅ ADD or REPLACE result field
        studentFound = true;
        delete student.result.name;
      }
      return student;
    });

    if (!studentFound) {
      return res.status(404).type('text').send('Invalid Roll No');
    }


    await writeDB(updatedStudents); // ✅ Save updated list to file

    res.status(200).send('Result saved successfully');

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getResult = async (req, res) => {
  try {
    const rollNo = req.params.rollNo;
    if (!rollNo) {
      return res.status(400).type('text').send('Roll No. Must Be Required');
    }

    const students = await readDB();
    const student = students.find(student => student?.result?.rollNo === rollNo);

    if (!student) {
      return res.status(404).type('text').send('Result Not Found');
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const students = await readDB();
    const id = req.params.id;
    const updatedData = req.body;

    if (!id) {
      return res.status(401).json({ error: 'Id must be required' });
    }

    const deleteFile = (oldPath) => {
      const fullPath = path.join('public', 'uploads', oldPath);
      if (fsOld.existsSync(fullPath)) {
        fsOld.unlinkSync(fullPath); // Or use fs.promises.unlink for async
      }
    };
    
    let isUpdated = false;

    const updatedStudents = students.map(student => {
      if (student.id === id) {
        isUpdated = true;

        if (req.files?.profilePic?.[0]) {
          deleteFile(student.profilePic);
          student.profilePic = req.files?.profilePic?.[0]?.filename
        }

        if (req.files?.signature?.[0]) {
          deleteFile(student.signature);
          student.signature = req.files?.signature?.[0].filename
        }

        if (req.files?.sheetCopy?.[0]) {
          deleteFile(student.sheetCopy);
          student.sheetCopy = req.files?.sheetCopy?.[0]?.filename
        }

        return {
          ...student,
          ...updatedData,
          result: updatedData?.result || student?.result || {}  // ✅ use updated result if sent
        };
      }
      return student;
    });

    if (!isUpdated) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await writeDB(updatedStudents);  // ✅ correct variable here

    res.status(201).json({ message: 'Student Successfully Updated', updatedStudents });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const deleteStudent = async (req, res) => {

  try {
    const students = await readDB();
    const id = req.params.id;
    const secretKey = req.params.secretKey;

    if (!id) {
      return res.status(401).json({ error: 'Id must be required' });
    }

    if (!secretKey || secretKey !== '123456') {
      return res.status(401).json({ error: 'SecretKey must be required or Invalid SecretKey' });
    }

    const updatedStudents = students.filter(student => student.id !== id);

    await writeDB(updatedStudents);

    res.status(201).json({ message: 'Student Successfully Deleted', updatedStudents })
  }
  catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
}

// To Rendring Page
export const pageUI = (req, res) => {
  const allowedPages = ['home', 'register', 'marksheet', 'result', 'status', 'export'];

  const requestedPage = req.params.page || 'home'; // ✅ default to 'home'

  if (allowedPages.includes(requestedPage)) {
    res.sendFile(path.join(rootDir, 'public', 'index.html'));
  }
  else {
    res.status(404).send('Page Not Found')
  }
};