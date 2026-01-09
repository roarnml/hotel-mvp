/*import { prisma } from "@/lib/prisma";

const userId = "some-staff-id";

const tasks = await prisma.housekeepingTask.findMany({
  where: {
    assignedToId: userId, // <- use the foreign key field
  },
  orderBy: {
    completedAt: "desc", // make sure the field exists in your model
  },
});
*/