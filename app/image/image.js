const { con } = require("../../model/DB");

class image {
    async saveImagesInfoAtDB(filenames) {
        const promises = filenames.map(filename => {
            const sql = "INSERT INTO images(Src, Filename) VALUES(?, ?)";
            const src = `http://127.0.0.1:8000/public/upload/${filename}`;

            return new Promise((resolve, reject) => {
                con.query(sql, [src, filename], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.insertId);
                    }
                });
            });
        });

        return Promise.all(promises);
    }
    async MessageBelonging(filesID, messageID) {
        const promises = filesID.map(ID => {
            return new Promise((resolve, reject) => {
                let sql = `UPDATE images SET Message_ID = ? WHERE ID = ?`
                con.query(sql, [messageID, ID], (err, result) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(true)
                })
            });
        })
        return Promise.all(promises)
    }
    async Owning(images){
        const nullImages = [];
        const promises = images.map(ID => {
            return new Promise((resolve, reject) => {
                let sql = `SELECT * FROM images WHERE ID = ? AND Message_ID IS NULL`;
                con.query(sql, [ID], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        nullImages.push(result);
                        resolve();  
                    }
                });
            });
        });
        
        await Promise.all(promises);
        let newArray = nullImages.filter(element => !Array.isArray(element) || element.length > 0);

        return newArray;
}}

module.exports = new image