import { prisma } from "../src/prisma"
import { comparePassword, hashPassword } from "../src/credentials/authorized"

const seeding = async () => {
    try {
        const user = await prisma.user.create({
            data: {
                email: "jader.jader55@gmail.com", password: await hashPassword("2&M3at@#"), name:"Jader"
            }
        })
        const user2 = await prisma.user.create({
            data: {
                email: "pessoalmariah@gmail.com", password: await hashPassword("2&M3at@#"), name:"Jader"
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