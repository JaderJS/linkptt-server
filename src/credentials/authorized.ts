import { compare, hash } from 'bcrypt';

const hashPassword = async (password: string): Promise<string> => {
    return await hash(password, 10)
}

const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    const match = await compare(password, hash)
    return match
}

export { hashPassword, comparePassword }