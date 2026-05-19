require("dotenv").config();

const cors = require("cors");
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");

const prisma = require("./services/prisma");

const generateInviteCode =
  require("./utils/generateCode");

const parseAssignment =
  require("./agents/parserAgent");

const app = express();

app.use(cors());

app.use(express.json());


// ============================
// TELEGRAM BOT
// ============================

const bot = new TelegramBot(
  process.env.BOT_TOKEN,
  {
    polling: true,
  }
);


// ============================
// REGISTRATION FLOW
// ============================

bot.onText(
  /\/start (.+)/,
  async (msg, match) => {

    const chatId =
      msg.chat.id.toString();

    const text = match[1];

    const parts = text.split(" ");

    const role = parts[0];

    // ============================
    // TEACHER REGISTRATION
    // ============================

    if (role === "teacher") {

      const existingTeacher =
        await prisma.teacher.findUnique({
          where: {
            telegramId: chatId,
          },
        });

      if (existingTeacher) {

        return bot.sendMessage(
          chatId,
          "Teacher already registered."
        );
      }

      const teacher =
        await prisma.teacher.create({
          data: {

            telegramId: chatId,

            name:
              msg.from.first_name,

            inviteCode:
              generateInviteCode(),

          },
        });

      return bot.sendMessage(
        chatId,
        `
Teacher registered successfully ✅

Invite Code:
${teacher.inviteCode}
        `
      );
    }


    // ============================
    // STUDENT REGISTRATION
    // ============================

    if (role === "student") {

      const inviteCode =
        parts[1];

      if (!inviteCode) {

        return bot.sendMessage(
          chatId,
          "Please provide invite code."
        );
      }

      const teacher =
        await prisma.teacher.findUnique({
          where: {
            inviteCode,
          },
        });

      if (!teacher) {

        return bot.sendMessage(
          chatId,
          "Invalid invite code."
        );
      }

      const existingStudent =
        await prisma.student.findUnique({
          where: {
            telegramId: chatId,
          },
        });

      if (existingStudent) {

        return bot.sendMessage(
          chatId,
          "Student already registered."
        );
      }

      await prisma.student.create({
        data: {

          telegramId: chatId,

          name:
            msg.from.first_name,

          teacherId:
            teacher.id,

        },
      });

      return bot.sendMessage(
        chatId,
        `
Student registered successfully ✅

Teacher:
${teacher.name}
        `
      );
    }

  }
);


// ============================
// MESSAGE FLOW
// ============================

bot.on(
  "message",
  async (msg) => {

    const chatId =
      msg.chat.id;

    if (!msg.text) {
      return;
    }


    // ============================
    // CREATE ASSIGNMENT
    // ============================

    if (
      msg.text.startsWith("Assign")
    ) {

      try {

        const parsed =
          await parseAssignment(
            msg.text
          );

        const teacher =
          await prisma.teacher.findUnique({
            where: {
              telegramId:
                chatId.toString(),
            },
          });

        if (!teacher) {

          return bot.sendMessage(
            chatId,
            "Teacher not registered."
          );
        }

        const student =
          await prisma.student.findFirst({
            where: {

              name:
                parsed.studentName,

              teacherId:
                teacher.id,

            },
          });

        if (!student) {

          return bot.sendMessage(
            chatId,
            `Student ${parsed.studentName} not found.`
          );
        }

        // CREATE DUE DATE

        const dueDate =
          new Date();

        dueDate.setDate(
          dueDate.getDate() +
          parsed.dueDays
        );

        // SAVE ASSIGNMENT

        const assignment =
          await prisma.assignment.create({
            data: {

              title:
                parsed.assignment,

              description:
                parsed.assignment,

              dueDate,

              status:
                "pending",

              teacherId:
                teacher.id,

              studentId:
                student.id,

            },
          });

        // SEND TO STUDENT

        await bot.sendMessage(
          student.telegramId,
          `
📚 New Assignment

Assignment:
${assignment.title}

Due in:
${parsed.dueDays} days
          `
        );

        return bot.sendMessage(
          chatId,
          `
Assignment Created Successfully ✅

Student:
${student.name}

Assignment:
${assignment.title}
          `
        );

      } catch (error) {

        console.log(error);

        return bot.sendMessage(
          chatId,
          "Could not create assignment."
        );
      }
    }


    // ============================
    // PROGRESS UPDATE
    // ============================

    if (
      msg.text
        .toLowerCase()
        .startsWith("progress")
    ) {

      try {

        const student =
          await prisma.student.findUnique({
            where: {
              telegramId:
                chatId.toString(),
            },
          });

        if (!student) {

          return bot.sendMessage(
            chatId,
            "Student not registered."
          );
        }

        const assignment =
          await prisma.assignment.findFirst({
            where: {
              studentId:
                student.id,
            },

            orderBy: {
              id: "desc",
            },
          });

        if (!assignment) {

          return bot.sendMessage(
            chatId,
            "No assignments found."
          );
        }

        const progressMessage =
          msg.text.replace(
            /progress/i,
            ""
          ).trim();

        await prisma.progress.create({
          data: {

            message:
              progressMessage,

            assignmentId:
              assignment.id,

          },
        });

        return bot.sendMessage(
          chatId,
          "Progress updated successfully ✅"
        );

      } catch (error) {

        console.log(error);

        return bot.sendMessage(
          chatId,
          "Could not update progress."
        );
      }
    }


    // ============================
    // SUBMIT ASSIGNMENT
    // ============================

    if (
      msg.text
        .toLowerCase()
        .startsWith("/submit")
    ) {

      try {

        const student =
          await prisma.student.findUnique({
            where: {
              telegramId:
                chatId.toString(),
            },
          });

        if (!student) {

          return bot.sendMessage(
            chatId,
            "Student not registered."
          );
        }

        const assignment =
          await prisma.assignment.findFirst({
            where: {
              studentId:
                student.id,
            },

            orderBy: {
              id: "desc",
            },
          });

        if (!assignment) {

          return bot.sendMessage(
            chatId,
            "No assignment found."
          );
        }

        const submission =
          msg.text.replace(
            "/submit",
            ""
          ).trim();

        await prisma.assignment.update({
          where: {
            id:
              assignment.id,
          },

          data: {

            submission,

            status:
              "submitted",

          },
        });

        return bot.sendMessage(
          chatId,
          "Assignment submitted successfully ✅"
        );

      } catch (error) {

        console.log(error);

        return bot.sendMessage(
          chatId,
          "Could not submit assignment."
        );
      }
    }


    // ============================
    // TEACHER FEEDBACK
    // ============================

    if (
      msg.text
        .toLowerCase()
        .startsWith("feedback")
    ) {

      try {

        const teacher =
          await prisma.teacher.findUnique({
            where: {
              telegramId:
                chatId.toString(),
            },
          });

        if (!teacher) {

          return bot.sendMessage(
            chatId,
            "Teacher not registered."
          );
        }

        const assignment =
          await prisma.assignment.findFirst({
            where: {

              teacherId:
                teacher.id,

              status:
                "submitted",

            },

            orderBy: {
              id: "desc",
            },

            include: {
              student: true,
            },
          });

        if (!assignment) {

          return bot.sendMessage(
            chatId,
            "No submitted assignments found."
          );
        }

        const feedbackMessage =
          msg.text.replace(
            /feedback/i,
            ""
          ).trim();

        const updatedAssignment =
          await prisma.assignment.update({
            where: {
              id:
                assignment.id,
            },

            data: {

              feedback:
                feedbackMessage,

              status:
                "completed",

            },
          });

        await bot.sendMessage(
          assignment.student.telegramId,
          `
📝 Teacher Feedback

Assignment:
${updatedAssignment.title}

Feedback:
${feedbackMessage}
          `
        );

        return bot.sendMessage(
          chatId,
          "Feedback sent successfully ✅"
        );

      } catch (error) {

        console.log(error);

        return bot.sendMessage(
          chatId,
          "Could not send feedback."
        );
      }
    }

  }
);


// ============================
// GET ASSIGNMENTS API
// ============================

app.get(
  "/assignments",
  async (req, res) => {

    try {

      const assignments =
        await prisma.assignment.findMany({

          include: {

            student: true,

            teacher: true,

            progressLogs: true,

          },

          orderBy: {
            id: "desc",
          },

        });

      res.json(assignments);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Could not fetch assignments",
      });
    }
  }
);


// ============================
// SUBMIT ASSIGNMENT API
// ============================

app.post(
  "/assignments/:id/submit",

  async (req, res) => {

    try {

      const id =
        parseInt(req.params.id);

      const { submission } =
        req.body;

      const updatedAssignment =
        await prisma.assignment.update({
          where: {
            id,
          },

          data: {

            submission,

            status: "submitted",

          },
        });

      res.json(
        updatedAssignment
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Could not submit assignment",
      });

    }
  }
);


// ============================
// MARK ASSIGNMENT COMPLETED
// ============================

app.post(
  "/assignments/:id/complete",
  async (req, res) => {

    const assignmentId =
      Number(req.params.id);

    try {

      const updatedAssignment =
        await prisma.assignment.update({

          where: {
            id:
              assignmentId,
          },

          data: {
            status:
              "completed",
          },

        });

      res.json(
        updatedAssignment
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Could not update assignment",
      });

    }

  }
);


// ============================
// REMINDER SCHEDULER
// ============================

cron.schedule(
  "0 9 * * *",
  async () => {

    console.log(
      "Running reminder check..."
    );

    try {

      const assignments =
        await prisma.assignment.findMany({

          where: {
            status: "pending",
          },

          include: {
            student: true,
          },

        });

      for (
        const assignment
        of assignments
      ) {

        const dueDate =
          new Date(
            assignment.dueDate
          );

        const today =
          new Date();

        const timeDifference =
          dueDate - today;

        const daysLeft =
          Math.ceil(
            timeDifference /
            (
              1000 *
              60 *
              60 *
              24
            )
          );

        await bot.sendMessage(
          assignment.student.telegramId,
          `
⏰ Assignment Reminder

Assignment:
${assignment.title}

Due in:
${daysLeft} day(s)

Please update your progress.
          `
        );

        console.log(
          `Reminder sent for assignment ${assignment.id}`
        );
      }

    } catch (error) {

      console.log(error);

    }

  }
);


// ============================
// TEST ROUTE
// ============================

app.get("/", (req, res) => {

  res.send(
    "Classroom Companion Running"
  );

});


// ============================
// START SERVER
// ============================

app.listen(
  3000,
  () => {

    console.log(
      "Server running on port 3000"
    );

  }
);