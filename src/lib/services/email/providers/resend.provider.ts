import type {EmailPayload, EmailProvider} from "~/types/email";
import {Resend} from "resend";


class ResendEmailProvider implements EmailProvider {
    private resend: Resend;
    private defaultFrom: string;

    constructor(opts: { apiKey: string; defaultFrom: string }){
        this.resend = new Resend(opts.apiKey);
        this.defaultFrom = opts.defaultFrom;
    }

    async send(mail: EmailPayload) {
        const res = await this.resend.emails.send({
            from: mail.from ?? this.defaultFrom,
           to: mail.to,
           text: mail.text?? "",
           html: mail.html,
           subject: mail.subject,
           cc: mail.cc,
           bcc: mail.bcc,
           headers: mail.headers,
        });
        // TODO Error handling
        // if(res.error) throw res.error;
        return {id: res.data?.id};
    }
}


export { ResendEmailProvider };



