"use server";

import dbConnect from "@/lib/mongodb";
import { Project, type EisenhowerQuadrant } from "@/lib/models/project";
import { Task } from "@/lib/models/task";
import { Person } from "@/lib/models/person";
import { Priority } from "@/lib/models/priority";
import { Position } from "@/lib/models/position";
import { ProjectTask } from "@/lib/models/project-task";
import { ProjectMember } from "@/lib/models/project-member";
import { TaskAssignment, type RACIRole } from "@/lib/models/task-assignment";
import { revalidatePath } from "next/cache";

// ─── Serialization helpers ──────────────────────────────────────────
function serializeDoc(doc: Record<string, unknown>) {
  const obj = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  obj._id = obj._id?.toString?.() ?? obj._id;
  if (obj.projectId) obj.projectId = obj.projectId.toString();
  if (obj.taskId) obj.taskId = obj.taskId.toString();
  if (obj.personId) obj.personId = obj.personId.toString();
  return JSON.parse(JSON.stringify(obj));
}

function serializeDocs(docs: Record<string, unknown>[]) {
  return docs.map(serializeDoc);
}

// ─── PROJECTS ───────────────────────────────────────────────────────
export async function getProjects() {
  await dbConnect();
  const projects = await Project.find().lean();
  return serializeDocs(projects as unknown as Record<string, unknown>[]);
}

export async function getProjectById(id: string) {
  await dbConnect();
  const project = await Project.findById(id).lean();
  if (!project) return null;
  return serializeDoc(project as unknown as Record<string, unknown>);
}

export async function createProject(data: {
  title: string;
  fromDate: string;
  toDate: string;
  priorityId: number;
  eisenhowerQuadrant: EisenhowerQuadrant;
}) {
  await dbConnect();
  const project = await Project.create({
    ...data,
    fromDate: new Date(data.fromDate),
    toDate: new Date(data.toDate),
  });
  revalidatePath("/");
  return serializeDoc(project as unknown as Record<string, unknown>);
}

export async function updateProjectQuadrant(
  id: string,
  quadrant: EisenhowerQuadrant
) {
  await dbConnect();
  await Project.findByIdAndUpdate(id, { eisenhowerQuadrant: quadrant });
  revalidatePath("/");
}

export async function updateProject(
  id: string,
  data: {
    title?: string;
    fromDate?: string;
    toDate?: string;
    priorityId?: number;
    eisenhowerQuadrant?: EisenhowerQuadrant;
  }
) {
  await dbConnect();
  const updateData: Record<string, unknown> = { ...data };
  if (data.fromDate) updateData.fromDate = new Date(data.fromDate);
  if (data.toDate) updateData.toDate = new Date(data.toDate);
  await Project.findByIdAndUpdate(id, updateData);
  revalidatePath("/");
  revalidatePath(`/projects/${id}`);
}

export async function deleteProject(id: string) {
  await dbConnect();
  await Promise.all([
    Project.findByIdAndDelete(id),
    ProjectTask.deleteMany({ projectId: id }),
    ProjectMember.deleteMany({ projectId: id }),
  ]);
  revalidatePath("/");
}

// ─── TASKS ──────────────────────────────────────────────────────────
export async function getTasksByProject(projectId: string) {
  await dbConnect();
  const links = await ProjectTask.find({ projectId }).lean();
  const taskIds = links.map((l) => l.taskId);
  const tasks = await Task.find({ _id: { $in: taskIds } }).lean();
  return serializeDocs(tasks as unknown as Record<string, unknown>[]);
}

export async function createTask(
  projectId: string,
  data: {
    title: string;
    description: string;
    fromDate: string;
    endDate: string;
    priorityId: number;
  }
) {
  await dbConnect();
  const task = await Task.create({
    ...data,
    fromDate: new Date(data.fromDate),
    endDate: new Date(data.endDate),
  });
  await ProjectTask.create({ projectId, taskId: task._id });
  revalidatePath(`/projects/${projectId}`);
  return serializeDoc(task as unknown as Record<string, unknown>);
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    fromDate?: string;
    endDate?: string;
    priorityId?: number;
  }
) {
  await dbConnect();
  const updateData: Record<string, unknown> = { ...data };
  if (data.fromDate) updateData.fromDate = new Date(data.fromDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  await Task.findByIdAndUpdate(taskId, updateData);
  revalidatePath("/");
}

export async function deleteTask(projectId: string, taskId: string) {
  await dbConnect();
  await Promise.all([
    Task.findByIdAndDelete(taskId),
    ProjectTask.deleteMany({ taskId }),
    TaskAssignment.deleteMany({ taskId }),
  ]);
  revalidatePath(`/projects/${projectId}`);
}

// ─── PEOPLE ─────────────────────────────────────────────────────────
export async function getPeople() {
  await dbConnect();
  const people = await Person.find().lean();
  return serializeDocs(people as unknown as Record<string, unknown>[]);
}

export async function createPerson(data: {
  name: string;
  lastName: string;
  idPosition: number;
}) {
  await dbConnect();
  const person = await Person.create(data);
  revalidatePath("/");
  return serializeDoc(person as unknown as Record<string, unknown>);
}

export async function deletePerson(personId: string) {
  await dbConnect();
  await Promise.all([
    Person.findByIdAndDelete(personId),
    ProjectMember.deleteMany({ personId }),
    TaskAssignment.deleteMany({ personId }),
  ]);
  revalidatePath("/");
}

// ─── PROJECT MEMBERS ────────────────────────────────────────────────
export async function getProjectMembers(projectId: string) {
  await dbConnect();
  const links = await ProjectMember.find({ projectId }).lean();
  const personIds = links.map((l) => l.personId);
  const people = await Person.find({ _id: { $in: personIds } }).lean();
  return serializeDocs(people as unknown as Record<string, unknown>[]);
}

export async function addProjectMember(projectId: string, personId: string) {
  await dbConnect();
  await ProjectMember.findOneAndUpdate(
    { projectId, personId },
    { projectId, personId },
    { upsert: true }
  );
  revalidatePath(`/projects/${projectId}`);
}

export async function removeProjectMember(
  projectId: string,
  personId: string
) {
  await dbConnect();
  await Promise.all([
    ProjectMember.deleteOne({ projectId, personId }),
    TaskAssignment.deleteMany({ personId }),
  ]);
  revalidatePath(`/projects/${projectId}`);
}

// ─── TASK ASSIGNMENTS (RACI) ────────────────────────────────────────
export async function getTaskAssignments(taskIds: string[]) {
  await dbConnect();
  const assignments = await TaskAssignment.find({
    taskId: { $in: taskIds },
  }).lean();
  return serializeDocs(assignments as unknown as Record<string, unknown>[]);
}

export async function setTaskAssignment(
  taskId: string,
  personId: string,
  raciRole: RACIRole,
  projectId: string
) {
  await dbConnect();
  if (raciRole === null) {
    await TaskAssignment.deleteOne({ taskId, personId });
  } else {
    await TaskAssignment.findOneAndUpdate(
      { taskId, personId },
      { taskId, personId, raciRole },
      { upsert: true }
    );
  }
  revalidatePath(`/projects/${projectId}`);
}

// ─── LOOKUP DATA ────────────────────────────────────────────────────
export async function getPriorities() {
  // const mmm = await dbConnect();
  const mongoose = await dbConnect();
  console.log("db:", mongoose.connection.db?.databaseName);
  console.log("host:", mongoose.connection.host);
  console.log("priority collection:", Priority.collection.name);
  console.log("count:", await Priority.countDocuments());
  const priorities = await Priority.find().sort({ priorityId: 1 }).lean();
  console.log('prioridades?', priorities)
  return serializeDocs(priorities as unknown as Record<string, unknown>[]);
}

export async function getPositions() {
  await dbConnect();
  const positions = await Position.find().sort({ idPosition: 1 }).lean();
  return serializeDocs(positions as unknown as Record<string, unknown>[]);
}
