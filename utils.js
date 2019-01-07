import fs from 'fs';
export const buffer = (filename) => {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats["size"]
    return fileSizeInBytes;
}
