import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set")
  process.exit(1)
}

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log("Connected to MongoDB")

  const db = mongoose.connection.db

  // Seed Priorities
  const priorities = [
    { priorityId: 1, titlePriority: "Critical" },
    { priorityId: 2, titlePriority: "High" },
    { priorityId: 3, titlePriority: "Medium" },
    { priorityId: 4, titlePriority: "Low" },
  ]
  await db.collection("priorities").deleteMany({})
  await db.collection("priorities").insertMany(priorities)
  console.log("Seeded priorities")

  // Seed Positions
  const positions = [
    { idPosition: 1, position: "Project Manager" },
    { idPosition: 2, position: "Developer" },
    { idPosition: 3, position: "Designer" },
    { idPosition: 4, position: "QA Engineer" },
    { idPosition: 5, position: "Business Analyst" },
  ]
  await db.collection("positions").deleteMany({})
  await db.collection("positions").insertMany(positions)
  console.log("Seeded positions")

  // Seed People
  await db.collection("people").deleteMany({})
  const people = await db.collection("people").insertMany([
    { name: "Alice", lastName: "Johnson", idPosition: 1 },
    { name: "Bob", lastName: "Smith", idPosition: 2 },
    { name: "Carol", lastName: "Williams", idPosition: 3 },
    { name: "David", lastName: "Brown", idPosition: 4 },
    { name: "Eve", lastName: "Davis", idPosition: 5 },
  ])
  console.log("Seeded people")

  // Seed Projects
  await db.collection("projects").deleteMany({})
  const projects = await db.collection("projects").insertMany([
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
      title: "Documentation Update",
      fromDate: new Date("2026-03-15"),
      toDate: new Date("2026-04-15"),
      priorityId: 3,
      eisenhowerQuadrant: "DELEGATE",
    },
    {
      title: "Legacy API Cleanup",
      fromDate: new Date("2026-05-01"),
      toDate: new Date("2026-07-31"),
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
  ])
  console.log("Seeded projects")

  // Seed Tasks
  await db.collection("tasks").deleteMany({})
  const tasks = await db.collection("tasks").insertMany([
    {
      title: "Design homepage mockups",
      description: "Create wireframes and high-fidelity mockups for the new homepage",
      fromDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-15"),
      priorityId: 1,
    },
    {
      title: "Implement responsive layout",
      description: "Build responsive grid system using CSS Grid and Flexbox",
      fromDate: new Date("2026-03-16"),
      endDate: new Date("2026-04-15"),
      priorityId: 2,
    },
    {
      title: "User authentication flow",
      description: "Implement login, register, and password reset flows",
      fromDate: new Date("2026-04-01"),
      endDate: new Date("2026-04-30"),
      priorityId: 1,
    },
    {
      title: "API endpoint testing",
      description: "Write integration tests for all REST endpoints",
      fromDate: new Date("2026-04-15"),
      endDate: new Date("2026-05-15"),
      priorityId: 3,
    },
    {
      title: "Performance optimization",
      description: "Optimize database queries and implement caching",
      fromDate: new Date("2026-05-01"),
      endDate: new Date("2026-05-31"),
      priorityId: 2,
    },
  ])
  console.log("Seeded tasks")

  // Link tasks to projects
  const projectIds = projects.insertedIds
  const taskIds = tasks.insertedIds

  await db.collection("projecttasks").deleteMany({})
  await db.collection("projecttasks").insertMany([
    { projectId: projectIds[0], taskId: taskIds[0] },
    { projectId: projectIds[0], taskId: taskIds[1] },
    { projectId: projectIds[1], taskId: taskIds[2] },
    { projectId: projectIds[1], taskId: taskIds[3] },
    { projectId: projectIds[4], taskId: taskIds[4] },
  ])
  console.log("Seeded project-task links")

  // Link people to projects
  const personIds = people.insertedIds
  await db.collection("projectmembers").deleteMany({})
  await db.collection("projectmembers").insertMany([
    { projectId: projectIds[0], personId: personIds[0], role: "" },
    { projectId: projectIds[0], personId: personIds[1], role: "" },
    { projectId: projectIds[0], personId: personIds[2], role: "" },
    { projectId: projectIds[1], personId: personIds[0], role: "" },
    { projectId: projectIds[1], personId: personIds[1], role: "" },
    { projectId: projectIds[1], personId: personIds[3], role: "" },
    { projectId: projectIds[4], personId: personIds[0], role: "" },
    { projectId: projectIds[4], personId: personIds[4], role: "" },
  ])
  console.log("Seeded project members")

  // Seed RACI assignments
  await db.collection("taskassignments").deleteMany({})
  await db.collection("taskassignments").insertMany([
    { taskId: taskIds[0], personId: personIds[2], projectId: projectIds[0], raciRole: "R" },
    { taskId: taskIds[0], personId: personIds[0], projectId: projectIds[0], raciRole: "A" },
    { taskId: taskIds[1], personId: personIds[1], projectId: projectIds[0], raciRole: "R" },
    { taskId: taskIds[1], personId: personIds[0], projectId: projectIds[0], raciRole: "A" },
    { taskId: taskIds[1], personId: personIds[2], projectId: projectIds[0], raciRole: "C" },
    { taskId: taskIds[2], personId: personIds[1], projectId: projectIds[1], raciRole: "R" },
    { taskId: taskIds[2], personId: personIds[0], projectId: projectIds[1], raciRole: "A" },
    { taskId: taskIds[3], personId: personIds[3], projectId: projectIds[1], raciRole: "R" },
    { taskId: taskIds[3], personId: personIds[0], projectId: projectIds[1], raciRole: "I" },
  ])
  console.log("Seeded RACI assignments")

  await mongoose.disconnect()
  console.log("Seed complete!")
}

seed().catch((err) => {
  console.error("Seed error:", err)
  process.exit(1)
})
