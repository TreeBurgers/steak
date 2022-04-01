

export class PubkeyStorage {
	    
    static get() : string | null {
	    
        let str =  localStorage.getItem("walletPubkey");

        return str;     
    }

	static set(pubkey : string) {
		
        localStorage.setItem("walletPubkey", pubkey);
	}

    static same( pubkey : string) : boolean {

        let str =  localStorage.getItem("walletPubkey");

        if ( str ){

            if ( str === pubkey) {

                return true; 
            } 
        }

        this.set(pubkey);

        return false ;

    }

}