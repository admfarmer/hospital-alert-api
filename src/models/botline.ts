const request = require("request");
export class BotlineModel {
    botLine(message) {
        request({
            method: 'POST',
            uri: 'https://notify-api.line.me/api/notify',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            auth: {
                // bearer: 'YJJwL2xL61hVSbVXHIFvTouDIZ56WjTEC28JTxdJ4Ko', //token กลุ่มแจ้งเหตุ
                bearer: 'EmP6lteGQibDC9Iqy0RcJMlYn4mnKQXyewpa2hlVC5t', //token 
            },
            form: {
                message: message, //ข้อความที่จะส่ง
            },
        }, (err, httpResponse, body) => {
            if (err) {
                console.log(err)
            } else {
                console.log(body)
            }
        })
    }
}