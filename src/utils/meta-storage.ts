import { NFTMeta } from "../states";


export class MetaStorage {
	    
    static get() : Array<NFTMeta> | undefined {
	    
        let str =  localStorage.getItem("nftMeta");

        let arr : Array<NFTMeta> =  str ? JSON.parse(str) : [];
        
        return arr; 
	}

    static clear(){
        
        let metas : Array<NFTMeta> = []; 
        let json = JSON.stringify(metas);
        localStorage.setItem("nftMeta", json);
    
    }

	static set(metas: Array<NFTMeta>) {
		
        let json = JSON.stringify(metas);
        localStorage.setItem("nftMeta", json);
	}


    static remove(meta : NFTMeta){

        let a = this.get();

        if ( a ){
            let newa = a.filter(item => item.mint !== meta.mint);
          
            this.set(newa);
        }

    }

    static add(meta : NFTMeta){

        let a = this.get();

        if ( a ){

            if ( !a.some( aa => aa.mint === meta.mint) ){

                a.push(meta);
            }
        }
        else {

            let arr : Array<NFTMeta> =  [];
            arr.push(meta);
            let json = JSON.stringify(arr);
            localStorage.setItem("nftMeta", json);

        }

    }
}
