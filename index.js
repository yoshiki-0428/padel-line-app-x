// モジュールのインポート
const express = require("express")();
const PORT = process.env.PORT || 3000;
const line = require("@line/bot-sdk"); // 追加

const config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// Webサーバー設定
express
    .get('/', (req, res) => res.send('Hello world!'))
    .post('/webhook', line.middleware(config), (req, res) => lineBot(req, res))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

function lineBot(req, res) {
    res.sendStatus(200);

    // イベントオブジェクトを順次処理。
    const promises = req.body.events.map(event => {
        const bot = new line.Client(config);
        console.log(event);
        switch (event.type) {
            case 'message':
                const messageObject = [
                    {
                        "type": "text",
                        "text": getReplyMessage(event.message.text)
                    },
                    {
                        "type": "template",
                        "altText": "datepicker action",
                        "template": {
                            "type": "buttons",
                            "title": "予約可能な日を検索する",
                            "text": "日付を選択する",
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
                    }
                ];
                return bot.replyMessage(event.replyToken, messageObject);
            case 'postback':
                const reserveDate = event.postback.params.date;
                console.log(reserveDate);
                return bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: '大井町パデルワンの空き状況は下のURLで確認できます。\n'
                        + `https://www.sporu.jp/padel?today=${reserveDate}\n`
                        + '所沢フットサルパーク パデルコートの空き状況は下のURLで確認できます。\n'
                        + `https://yoyaku.fcjapan.jp/team/scripts/user/faci_schedule.php?faci_id=65&date=${reserveDate}&only=\n`
                        // + 'パデル東京の空き状況は下のURLで確認できます。\n'
                        // + `https://liv.lan.jp/padel/hp/rental_table.php?day=${reserveDate.replace(/-/g, '')}\n`
                });
        }
    });

    Promise.all(promises)
        .then(() => res.json({ success: true }))
        .catch(err => console.log(err));
}

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
