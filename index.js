// -----------------------------------------------------------------------------
// モジュールのインポート
const scraperjs = require('scraperjs');
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// -----------------------------------------------------------------------------
// ルーター設定
server.post('/bot/webhook', line.middleware(line_config), (req, res, next) => {
    // 先行してLINE側にステータスコード200でレスポンスする。
    res.sendStatus(200);

    // すべてのイベント処理のプロミスを格納する配列。
    let events_processed = [];

    // イベントオブジェクトを順次処理。
    req.body.events.forEach((event) => {
        console.log(event);
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type === "message" && event.message.type === "text") {
            // replyMessage()で返信し、そのプロミスをevents_processedに追加。
            // events_processed.push(bot.replyMessage(event.replyToken, {
            //     type: "text",
            //     text: getReplyMessage(event.message.text)
            // }));
            const messageObject = {
                "type": "template",
                "altText": "datepicker action",
                "template": {
                    "type": "buttons",
                    "title": "予約したい日程を選択してね",
                    "actions": [
                        {
                            "type": "datetimepicker",
                            "label": "予約できる日を検索する",
                            "mode": "date",
                            "data": "action=datetemp&selectId=1"
                        },
                        {
                            "type": "postback",
                            "label": "キャンセルする",
                            "data": "action=cancel&selectId=2"
                        },
                    ]
                }
            };
            events_processed.push(bot.replyMessage(event.replyToken, messageObject))

        }
        // else if (event.type === 'postback') {
        //     const reserveDate = event.postback.params.date;
        //     console.log(reserveDate)
        //     events_processed.push(bot.replyMessage(event.replyToken, {
        //         type: "text",
        //         text: `${reserveDate} の日程ですね。ただいま確認します。`
        //     }));
        //
        //     events_processed.push(bot.replyMessage(event.replyToken, {
        //         type: "text",
        //         text: '大井町は下のURLで確認できます。\n'
        //             + `https://www.sporu.jp/padel?today=${reserveDate}\n`
        //             + '所沢は下のURLで確認できます。\n'
        //             + `https://www.sporu.jp/padel?today=${reserveDate}\n`
        //             + 'パデル東京は下のURLで確認できます。\n'
        //             + `https://www.sporu.jp/padel?today=${reserveDate}\n`
        //     }));
        // }
    });

    // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );});

function getReplyMessage(message) {
    if (message.indexOf('大井町') !== -1) {
        return '大井町' + ' ' + 'https://www.sporu.jp/padel/'
    }
    if (message.indexOf('所沢') !== -1) {
        return '所沢' + ' ' + 'http://tokorozawafp.com/PADEL/news.php/'
    }
    if (message.indexOf('パデル東京') !== -1) {
        return 'パデル東京' + ' ' + 'http://www.padelasia.jp/'
    }
    if (message.indexOf('パデル') !== -1) {
        return 'パデル'
    }
    return "私は関東のパデル施設の予約状況を回答するLine botです。「明日のパデルできるところ」などメッセージしてみてください。"
}
