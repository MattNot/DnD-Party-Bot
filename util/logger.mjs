import { appendFile } from 'fs';

export class Logger {
    log_txt;
    error_txt;
    c;
    // l_stream;
    // e_stream;
    constructor(log_txt='', error_txt='', out_on_console=true) {
        this.log_txt = log_txt == '' ? 'log.txt' : log_txt;
        this.error_txt = error_txt == '' ? 'error.txt' : error_txt;
        this.c = out_on_console;
        
        // this.l_stream = createWriteStream(this.log_txt, {flags: 'a'});
        // this.e_stream = createWriteStream(this.error_txt, {flags: 'a'});
    }
    log(mess)  {
        let time = new Date();
        const out = `${time.toDateString()} | ${time.toLocaleTimeString()}.${time.getMilliseconds()} - ${mess}\n`
        // if (this.log_txt)   {
            // if (!this.l_stream) this.l_stream = createWriteStream(this.log_txt, {flags: 'a'});
        //     this.l_stream.write(out+'\n');
        // }
        appendFile(this.log_txt, out, (e) => {
            if (e) throw e;
        });
        if (this.c) console.log(out);
    }
    info(mess)  {
        let time = new Date();
        const out = `${time.toDateString()} | ${time.toLocaleTimeString()}.${time.getMilliseconds()} - ${mess}\n`
        appendFile(this.log_txt, out, (e) => {
            if (e) throw e;
        });
        if (this.c) console.info(out);
    }
    warn(mess)  {
        let time = new Date();
        const out = `${time.toDateString()} | ${time.toLocaleTimeString()}.${time.getMilliseconds()} - ${mess}\n`
        appendFile(this.log_txt, out, (e) => {
            if (e) throw e;
        });
        if (this.c) console.warn(out);
    }
    error(mess, err=null) {
        let time = new Date();
        const out = `${time.toDateString()} | ${time.toLocaleTimeString()}.${time.getMilliseconds()} - ${mess}\n`
        // if (this.error_txt)   {
            // if (!this.e_stream) this.e_stream = createWriteStream(this.error_txt, {flags: 'a'});
        //     this.e_stream.write(out+'\n');
        // }
        appendFile(this.error_txt, out+(err?err:''),(e) => {
            if (e) throw e;
        });
        if (this.c) console.error(out, err);
    }
    // close() {
    //     this.l_stream.close();
    //     this.e_stream.close();
    // }
}
