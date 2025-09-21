import { initTRPC } from "@trpc/server"
import { z } from "zod"
import { prisma } from "./db"

const t = initTRPC.create()

export const router = t.router
export const publicProcedure = t.procedure

export const appRouter = router({
  // Guest procedures
  guests: router({
    getAll: publicProcedure
      .input(
        z.object({
          includeDeclined: z.boolean().default(true),
        }),
      )
      .query(async ({ input }) => {
        const where = input.includeDeclined ? {} : { rsvpStatus: { not: "DECLINED" } }

        return await prisma.guest.findMany({
          where,
          include: {
            table: true,
            relationshipsFrom: {
              include: {
                guestTo: true,
              },
            },
            relationshipsTo: {
              include: {
                guestFrom: true,
              },
            },
          },
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        })
      }),

    getById: publicProcedure.input(z.string()).query(async ({ input }) => {
      return await prisma.guest.findUnique({
        where: { id: input },
        include: {
          table: true,
          relationshipsFrom: {
            include: {
              guestTo: true,
            },
          },
          relationshipsTo: {
            include: {
              guestFrom: true,
            },
          },
        },
      })
    }),

    create: publicProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          rsvpStatus: z.enum(["PENDING", "ACCEPTED", "DECLINED", "MAYBE"]).default("PENDING"),
          dietaryRestrictions: z.string().optional(),
          plusOne: z.boolean().default(false),
          notes: z.string().optional(),
          tableId: z.string().nullable().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return await prisma.guest.create({
          data: input,
          include: {
            table: true,
          },
        })
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          firstName: z.string().min(1).optional(),
          lastName: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          rsvpStatus: z.enum(["PENDING", "ACCEPTED", "DECLINED", "MAYBE"]).optional(),
          dietaryRestrictions: z.string().optional(),
          plusOne: z.boolean().optional(),
          notes: z.string().optional(),
          tableId: z.string().nullable().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input
        return await prisma.guest.update({
          where: { id },
          data,
          include: {
            table: true,
          },
        })
      }),

    delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
      return await prisma.guest.delete({
        where: { id: input },
      })
    }),
  }),

  // Relationship procedures
  relationships: router({
    getAll: publicProcedure.query(async () => {
      return await prisma.relationship.findMany({
        include: {
          guestFrom: true,
          guestTo: true,
        },
      })
    }),

    create: publicProcedure
      .input(
        z.object({
          guestFromId: z.string(),
          guestToId: z.string(),
          relationshipType: z.enum([
            "FAMILY",
            "FRIEND",
            "COLLEAGUE",
            "PARTNER",
            "SPOUSE",
            "SIBLING",
            "PARENT",
            "CHILD",
            "COUSIN",
            "ACQUAINTANCE",
          ]),
          strength: z.number().min(1).max(5).default(1),
          notes: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return await prisma.relationship.create({
          data: input,
          include: {
            guestFrom: true,
            guestTo: true,
          },
        })
      }),

    delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
      return await prisma.relationship.delete({
        where: { id: input },
      })
    }),
  }),

  // Table procedures
  tables: router({
    getAll: publicProcedure.query(async () => {
      return await prisma.table.findMany({
        include: {
          guests: true,
          _count: {
            select: {
              guests: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      })
    }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          capacity: z.number().min(1).default(8),
          description: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return await prisma.table.create({
          data: input,
        })
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          capacity: z.number().min(1).optional(),
          description: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input
        return await prisma.table.update({
          where: { id },
          data,
        })
      }),

    delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
      return await prisma.table.delete({
        where: { id: input },
      })
    }),

    assignGuest: publicProcedure
      .input(
        z.object({
          guestId: z.string(),
          tableId: z.string().nullable().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return await prisma.guest.update({
          where: { id: input.guestId },
          data: { tableId: input.tableId },
          include: {
            table: true,
          },
        })
      }),
  }),

  // Photo procedures
  photos: router({
    getAll: publicProcedure
      .input(
        z.object({
          hideAssigned: z.boolean().default(false),
        }),
      )
      .query(async ({ input }) => {
        return await prisma.photo.findMany({
          include: {
            guestAssignments: {
              include: {
                guest: true,
              },
            },
          },
          where: input.hideAssigned
            ? {
                guestAssignments: {
                  none: {},
                },
              }
            : undefined,
          orderBy: {
            fileName: "asc",
          },
        })
      }),

    assignGuests: publicProcedure
      .input(
        z.object({
          photoId: z.string(),
          guestIds: z.array(z.string()),
        }),
      )
      .mutation(async ({ input }) => {
        // Remove existing assignments for this photo
        await prisma.photoAssignment.deleteMany({
          where: { photoId: input.photoId },
        })

        // Create new assignments
        if (input.guestIds.length > 0) {
          await prisma.photoAssignment.createMany({
            data: input.guestIds.map((guestId) => ({
              photoId: input.photoId,
              guestId,
            })),
          })
        }

        return await prisma.photo.findUnique({
          where: { id: input.photoId },
          include: {
            guestAssignments: {
              include: {
                guest: true,
              },
            },
          },
        })
      }),

    removeGuestAssignment: publicProcedure
      .input(
        z.object({
          photoId: z.string(),
          guestId: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        await prisma.photoAssignment.delete({
          where: {
            guestId_photoId: {
              guestId: input.guestId,
              photoId: input.photoId,
            },
          },
        })

        return await prisma.photo.findUnique({
          where: { id: input.photoId },
          include: {
            guestAssignments: {
              include: {
                guest: true,
              },
            },
          },
        })
      }),
  }),
})

export type AppRouter = typeof appRouter
