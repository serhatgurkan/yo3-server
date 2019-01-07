import fs from 'fs';
import path from 'path';
import readline from 'readline';
import ffmpeg from 'fluent-ffmpeg';
import express from 'express';
import bodyParser from 'body-parser';
import ytdl from 'ytdl-core';
import buffer from './utils.js';

const app = express();
const port = process.env.PORT || 8001;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.get('/', (request, response) => {
    response.sendFile(__dirname + "/welcome.html")
})

app.get('/api/v1/fuck', (request, response) => {
    const id = request.query.id
    const token = request.query.token;
    ytdl.getInfo(id, (err, info) => {
        if(err) throw err;
        const stream = ytdl(id, {quality:"highestaudio"})
        const title = info.title
        ffmpeg(stream)
        .audioBitrate(128)
        .save(`${title}.mp3`)
        .on('progress', (target) => {
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`${target.targetSize}kb downloaded`);
        })
        .on('end', () => {
           /*  const fp = path.join(__dirname, `${title}.mp3`);
            const stat = fileSystem.statSync(fp);
            response.status(200).send({
                title:title,
                time:Date.now() - begin / 1000
            })
            response.writeHead(200, {
                'Content-Type': 'audio/mpeg',
                'Content-Length': buffer(`${title}.mp3`)
            })
            fs.createReadStream(`${title}.mp3`).pipe(response); */
            const path = `${title}.mp3`;
            const stat = fs.statSync(path)
            const fileSize = stat.size
            const range = request.headers.range

            if(range){
                const parts = range.replace(/bytes=/, "").split("-")
                const start = parseInt(parts[0], 10)
                const end = parts[1] 
                  ? parseInt(parts[1], 10)
                  : fileSize-1
                const chunksize = (end-start)+1
                const file = fs.createReadStream(path, {start, end})
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'audio/mpeg'
                }
                response.writeHead(206, head);
                file.pipe(response);
            }else{
                /* console.log(title);
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': 'audio/mpeg',
                    'Content-Disposition':'attachment; filename='+title+'.mp3'

                }
                response.writeHead(200, head)
                fs.createReadStream(path).pipe(response) */
                response.download(`${title}.mp3`);
            }
        })
    })

})
app.listen(port, () => {
    console.log(`server running on port ${port}`);
})