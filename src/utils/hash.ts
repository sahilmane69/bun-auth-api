// src/utils/hash.ts
import bcrypt from "bcryptjs";

const bcryptAny = bcrypt as any;

export async function hashPassword(password: string) {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
}

export async function comparePassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
}
