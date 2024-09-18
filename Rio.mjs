import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

class Rio{


    constructor(rioPath = '.'){

        // this is where .rio will be created
        this.rioPath = path.join(rioPath, '.rio');
        this.objectsPath = path.join(this.rioPath, 'objects')
        this.headPath = path.join(this.rioPath, 'HEAD')

        // staging area
        this.indexPath = path.join(this.rioPath, 'index')

        this.initialize()
    }


    async initialize(){

        await fs.mkdir(this.objectsPath, {recursive: true})

        try{
            await fs.writeFile(this.headPath, '', {flag:'wx'})

            await fs.writeFile(this.indexPath, JSON.stringify([]), {flag:'wx'})
        }
        catch(error){
            console.log("This project is already being tracked by Rio.")
        }
    }


    hashObject(content){
        return crypto.createHash('sha1').update(content, 'utf-8').digest('hex')
    }

    async addFileAndfolder(contentTobeAdded){

        const data = await fs.readFile(contentTobeAdded, {encoding: 'utf-8'});
        const datahash = this.hashObject(data);

        // the name of the object files are same as the hashed value (starting 2 chars are the folder name and remaining is file name)
        // for now implementing the simple version of objects like folder in git the names are directly hashes

        const newFileHashedObjectPath = path.join(this.objectsPath, datahash)
        await fs.writeFile(newFileHashedObjectPath, data)


        await this.updateStageArea(contentTobeAdded, datahash)
    }


    async updateStageArea(filePath, fileHash){
 

        const index = JSON.parse(await fs.readFile(this.indexPath, {encoding: 'utf-8'}));

        // adding file
        index.push({ 
            path : filePath,
            hash : fileHash
         });

        await fs.writeFile(this.indexPath, JSON.stringify(index))
    }
}


const rioVersionController = new Rio();
rioVersionController.addFileAndfolder('README.md')