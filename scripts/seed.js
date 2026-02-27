import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  await mongoose.connection.db.dropDatabase();
  console.log("Dropped existing database");

  const priorityCol = mongoose.connection.collection("priorities");
  await priorityCol.insertMany([
    { priorityId: 1, titlePriority: "Critical" },
    { priorityId: 2, titlePriority: "High" },
    { priorityId: 3, titlePriority: "Medium" },
    { priorityId: 4, titlePriority: "Low" },
  ]);
  console.log("Seeded priorities");

  const positionCol = mongoose.connection.collection("positions");
  await positionCol.insertMany([
    { idPosition: 1, position: "Project Manager" },
    { idPosition: 2, position: "Developer" },
    { idPosition: 3, position: "Designer" },
    { idPosition: 4, position: "QA Engineer" },
    { idPosition: 5, position: "Business Analyst" },
  ]);
  console.log("Seeded positions");

  const personCol = mongoose.connection.collection("people");
  const people = await personCol.insertMany([
    { name: "Alice", lastName: "Johnson", idPosition: 1 },
    { name: "Bob", lastName: "Smith", idPosition: 2 },
    { name: "Carol", lastName: "Williams", idPosition: 3 },
    { name: "David", lastName: "Brown", idPosition: 4 },
    { name: "Eva", lastName: "Davis", idPosition: 5 },
  ]);
  console.log("Seeded people");

  const projectCol = mongoose.connection.collection("projects");
  const projects = await projectCol.insertMany([
    {
      title: "Website Redesign",
      fromDate: new Date("2026-03-01"),
      toDate: new Date("2026-06-30"),
      priorityId: 1,
      eisenhowerQuadrant: "DO",
    },
    {
      title: "Mobile App v2",
      fromDate: new Date("2026-04-01"),
      toDate: new Date("2026-09-30"),
      priorityId: 2,
      eisenhowerQuadrant: "SCHEDULE",
    },
    {
      title: "API Documentation",
      fromDate: new Date("2026-03-15"),
      toDate: new Date("2026-04-30"),
      priorityId: 3,
      eisenhowerQuadrant: "DELEGATE",
    },
    {
      title: "Legacy Code Cleanup",
      fromDate: new Date("2026-05-01"),
      toDate: new Date("2026-12-31"),
      priorityId: 4,
      eisenhowerQuadrant: "ELIMINATE",
    },
    {
      title: "Security Audit",
      fromDate: new Date("2026-03-01"),
      toDate: new Date("2026-03-31"),
      priorityId: 1,
      eisenhowerQuadrant: "DO",
    },
  ]);
  console.log("Seeded projects");

  const projectIds = Object.values(projects.insertedIds);
  const personIds = Object.values(people.insertedIds);

  const taskCol = mongoose.connection.collection("tasks");
  const tasks = await taskCol.insertMany([
    { title: "Design homepage mockups", description: "Create wireframes and high-fidelity mockups for the new homepage", fromDate: new Date("2026-03-01"), endDate: new Date("2026-03-15"), priorityId: 1 },
    { title: "Implement auth flow", description: "Build login, register, and password reset pages", fromDate: new Date("2026-03-10"), endDate: new Date("2026-03-25"), priorityId: 1 },
    { title: "Database migration", description: "Migrate from PostgreSQL to MongoDB", fromDate: new Date("2026-03-15"), endDate: new Date("2026-04-01"), priorityId: 2 },
    { title: "Write API docs", description: "Document all REST endpoints", fromDate: new Date("2026-03-15"), endDate: new Date("2026-04-15"), priorityId: 3 },
    { title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment", fromDate: new Date("2026-04-01"), endDate: new Date("2026-04-15"), priorityId: 2 },
    { title: "User testing sessions", description: "Conduct 5 usability testing sessions with real users", fromDate: new Date("2026-04-15"), endDate: new Date("2026-05-01"), priorityId: 2 },
    { title: "Performance optimization", description: "Reduce load time to under 2 seconds", fromDate: new Date("2026-05-01"), endDate: new Date("2026-05-15"), priorityId: 3 },
    { title: "Penetration testing", description: "Run automated and manual security tests", fromDate: new Date("2026-03-10"), endDate: new Date("2026-03-25"), priorityId: 1 },
  ]);
  console.log("Seeded tasks");

  const taskIds = Object.values(tasks.insertedIds);

  const ptCol = mongoose.connection.collection("projecttasks");
  await ptCol.insertMany([
    { projectId: projectIds[0], taskId: taskIds[0] },
    { projectId: projectIds[0], taskId: taskIds[1] },
    { projectId: projectIds[0], taskId: taskIds[5] },
    { projectId: projectIds[1], taskId: taskIds[2] },
    { projectId: projectIds[1], taskId: taskIds[4] },
    { projectId: projectIds[2], taskId: taskIds[3] },
    { projectId: projectIds[3], taskId: taskIds[6] },
    { projectId: projectIds[4], taskId: taskIds[7] },
  ]);
  console.log("Seeded project-tasks");

  const pmCol = mongoose.connection.collection("projectmembers");
  await pmCol.insertMany([
    { projectId: projectIds[0], personId: personIds[0] },
    { projectId: projectIds[0], personId: personIds[1] },
    { projectId: projectIds[0], personId: personIds[2] },
    { projectId: projectIds[1], personId: personIds[1] },
    { projectId: projectIds[1], personId: personIds[3] },
    { projectId: projectIds[2], personId: personIds[4] },
    { projectId: projectIds[3], personId: personIds[1] },
    { projectId: projectIds[4], personId: personIds[0] },
    { projectId: projectIds[4], personId: personIds[3] },
  ]);
  console.log("Seeded project-members");

  const taCol = mongoose.connection.collection("taskassignments");
  await taCol.insertMany([
    { taskId: taskIds[0], personId: personIds[2], raciRole: "R" },
    { taskId: taskIds[0], personId: personIds[0], raciRole: "A" },
    { taskId: taskIds[1], personId: personIds[1], raciRole: "R" },
    { taskId: taskIds[1], personId: personIds[0], raciRole: "A" },
    { taskId: taskIds[1], personId: personIds[2], raciRole: "C" },
    { taskId: taskIds[2], personId: personIds[1], raciRole: "R" },
    { taskId: taskIds[2], personId: personIds[3], raciRole: "I" },
    { taskId: taskIds[3], personId: personIds[4], raciRole: "R" },
    { taskId: taskIds[3], personId: personIds[0], raciRole: "A" },
    { taskId: taskIds[7], personId: personIds[3], raciRole: "R" },
    { taskId: taskIds[7], personId: personIds[0], raciRole: "A" },
  ]);
  console.log("Seeded task-assignments");

  console.log("Seed complete!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
