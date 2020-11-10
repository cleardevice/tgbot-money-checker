import async from 'async'
import checkQiwi from './checkQiwi.js'
import checkYanex from './checkYandex.js'

const checksToPerform = [checkQiwi, checkYanex]
setInterval(() => {
    async.parallel(checksToPerform)
}, 60*1000)
