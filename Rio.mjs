import path from 'path';
import fs from 'fs/promises';

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
}


const rioVersionController = new Rio();