import { prisma } from "../src/prisma"
import { comparePassword, hashPassword } from "../src/credentials/authorized"

const seeding = async () => {
    try {
        const user = await prisma.user.create({
            data: {
                email: "admin@gmail.com", password: await hashPassword("admin"),
            }
        })

        await prisma.channel.create({ data: { name: "debug", profileUrl: "https://", owner: { connect: { cuid: user.cuid } } } })
    } catch (error) {
        throw new Error(`[PRISMA]: Error seed db: ${error}`)
    }
}

seeding().then(() => {
    console.log("Seed running successfully")
}).catch((error) => {
    console.error("Error running seed, view more: ", error)
})