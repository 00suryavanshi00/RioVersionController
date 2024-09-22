import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

class Rio{


    constructor(rioPath = '.'){

        // this is where .rio will be created
        this.rioPath = path.join(rioPath, '.rio');


        // all the hashed objects are stored here commits, staged files etc
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
        console.log(`file has been added to index ${filePath} and hash is ${fileHash}`)
    }


    async getHead(){
        try{

            return await fs.readFile(this.headPath, {encoding: 'utf-8'});
        }
        catch(e){
            return null 
            console.log("Faulty Head!!")
        }
    }

    async getCommitData(commitHash){
        
        const commitPath = path.join(this.objectsPath, commitHash)

        try{
            return await fs.readFile(commitPath, {encoding:'utf-8'})
        }
        catch(e){
            console.log("Error while reading file")
            return null;
        }

    }

    async commit(message){


        const index = JSON.parse(await fs.readFile(this.indexPath, {encoding: 'utf-8'}));
        const lastCommit = await this.getHead();

        const commitData = {

            //TODO add author
            "author" : "",
            "timeStamp" : new Date().toISOString(),
            "message" : message,
            "parent" : lastCommit,
            "files" : index
        } 


        // since commit is a also stored as a hash object in objects folder
        const commitHash = this.hashObject(JSON.stringify(commitData))
        const commitPath =  path.join(this.objectsPath, commitHash)
        await fs.writeFile(commitPath, JSON.stringify(commitData))

        // update the head to latest commit
        await fs.writeFile(this.headPath, commitHash)

        // clear the staging area now
        await fs.writeFile(this.indexPath, JSON.stringify([]));


        console.log(`file has been commited ${commitPath} and hash is ${commitHash}`)
    }

    async log(){
        let currentCommitHash = await this.getHead(); //this fetches the current head

        // till it reaches root # this is a reverse traversal to mimic sort of how git shows from the recent most commit
        let commitCount = 0
        while(currentCommitHash) {

            const commitData = await this.getCommitData(currentCommitHash)
            console.log(commitData)
            console.log(`Commit Number: ${commitCount++}\nCommit: ${commitData.hash} \n Date: ${commitData["timeStamp"]}`)

            currentCommitHash = commitData.parent;
        }

    }

    async diff(commitHash){

    }
}


(async ()=> {

    const rioVersionController = new Rio();
    // await rioVersionController.commit("added the file to commit")
    // await rioVersionController.addFileAndfolder('README.md')


    await rioVersionController.log();
})();
