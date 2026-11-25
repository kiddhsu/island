import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'banks')

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function choice(id, prompt, choices, answerIndex, explain, engine = 'choice') {
  return { id, engine, prompt, choices, answerIndex, explain }
}

function writeIsland(islandId, g1, g2) {
  const dir = join(root, islandId)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'g1.json'), JSON.stringify(g1, null, 2), 'utf8')
  writeFileSync(join(dir, 'g2.json'), JSON.stringify(g2, null, 2), 'utf8')
  console.log(islandId, g1.length, g2.length)
}

// —— 注音 ——
const initials = 'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ'.split('')
const finals = 'ㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ'.split('')
const tones = [
  { mark: 'ˊ', name: '二聲' },
  { mark: 'ˇ', name: '三聲' },
  { mark: 'ˋ', name: '四聲' },
  { mark: '˙', name: '輕聲' },
]
const zhuyinWords = [
  ['貓', 'ㄇㄠ'],
  ['狗', 'ㄍㄡˇ'],
  ['花', 'ㄏㄨㄚ'],
  ['鳥', 'ㄋㄧㄠˇ'],
  ['山', 'ㄕㄢ'],
  ['水', 'ㄕㄨㄟˇ'],
  ['火', 'ㄏㄨㄛˇ'],
  ['人', 'ㄖㄣˊ'],
  ['手', 'ㄕㄡˇ'],
  ['腳', 'ㄐㄧㄠˇ'],
  ['天', 'ㄊㄧㄢ'],
  ['地', 'ㄉㄧˋ'],
  ['大', 'ㄉㄚˋ'],
  ['小', 'ㄒㄧㄠˇ'],
  ['多', 'ㄉㄨㄛ'],
  ['少', 'ㄕㄠˇ'],
  ['上', 'ㄕㄤˋ'],
  ['下', 'ㄒㄧㄚˋ'],
  ['中', 'ㄓㄨㄥ'],
  ['國', 'ㄍㄨㄛˊ'],
  ['學', 'ㄒㄩㄝˊ'],
  ['校', 'ㄒㄧㄠˋ'],
  ['老', 'ㄌㄠˇ'],
  ['師', 'ㄕ'],
  ['同', 'ㄊㄨㄥˊ'],
  ['學', 'ㄒㄩㄝˊ'],
  ['爸', 'ㄅㄚˋ'],
  ['媽', 'ㄇㄚ'],
  ['弟', 'ㄉㄧˋ'],
  ['妹', 'ㄇㄟˋ'],
  ['吃', 'ㄔ'],
  ['喝', 'ㄏㄜ'],
  ['跑', 'ㄆㄠˇ'],
  ['跳', 'ㄊㄧㄠˋ'],
  ['書', 'ㄕㄨ'],
  ['筆', 'ㄅㄧˇ'],
  ['車', 'ㄔㄜ'],
  ['門', 'ㄇㄣˊ'],
  ['窗', 'ㄔㄨㄤ'],
  ['燈', 'ㄉㄥ'],
  ['雨', 'ㄩˇ'],
  ['風', 'ㄈㄥ'],
  ['雲', 'ㄩㄣˊ'],
  ['月', 'ㄩㄝˋ'],
  ['星', 'ㄒㄧㄥ'],
]

function buildZhuyin(grade) {
  const qs = []
  let n = 0
  for (const [ch, zy] of zhuyinWords) {
    const wrong = shuffle(zhuyinWords.filter((w) => w[1] !== zy))
      .slice(0, 3)
      .map((w) => w[1])
    const choices = shuffle([zy, ...wrong])
    qs.push(
      choice(
        `zhuyin-${grade}-${++n}`,
        `「${ch}」的注音是哪一個？`,
        choices,
        choices.indexOf(zy),
        `${ch} 讀作 ${zy}`,
      ),
    )
  }
  for (let i = 0; i < initials.length && qs.length < 55; i++) {
    const right = initials[i]
    const wrong = shuffle(initials.filter((x) => x !== right)).slice(0, 3)
    const choices = shuffle([right, ...wrong])
    qs.push(
      choice(
        `zhuyin-${grade}-init-${i}`,
        `哪一個是聲母？找出「${right}」`,
        choices,
        choices.indexOf(right),
      ),
    )
  }
  for (let i = 0; i < tones.length; i++) {
    const t = tones[i]
    const others = tones.filter((x) => x.name !== t.name).map((x) => x.name)
    const choices = shuffle([t.name, ...others])
    qs.push(
      choice(
        `zhuyin-${grade}-tone-${i}`,
        `注音符號「${t.mark}」是什麼聲？`,
        choices,
        choices.indexOf(t.name),
      ),
    )
  }
  if (grade === 2) {
    const compounds = [
      ['明天', 'ㄇㄧㄥˊ ㄊㄧㄢ'],
      ['謝謝', 'ㄒㄧㄝˋ ㄒㄧㄝˋ'],
      ['朋友', 'ㄆㄥˊ ㄧㄡˇ'],
      ['快樂', 'ㄎㄨㄞˋ ㄌㄜˋ'],
      ['學校', 'ㄒㄩㄝˊ ㄒㄧㄠˋ'],
      ['教室', 'ㄐㄧㄠˋ ㄕˋ'],
      ['公園', 'ㄍㄨㄥ ㄩㄢˊ'],
      ['吃飯', 'ㄔ ㄈㄢˋ'],
    ]
    for (const [w, zy] of compounds) {
      const wrong = shuffle(compounds.filter((c) => c[1] !== zy))
        .slice(0, 3)
        .map((c) => c[1])
      const choices = shuffle([zy, ...wrong])
      qs.push(
        choice(
          `zhuyin-2-word-${w}`,
          `「${w}」怎麼拼？`,
          choices,
          choices.indexOf(zy),
        ),
      )
    }
  }
  return qs.slice(0, Math.max(45, qs.length))
}

// —— 識字 ——
const charsG1 = '大小多少上下中左右來去出入早晚父母子女手足口耳目山水火木土日月星風雨雲花鳥魚蟲車門窗書筆紙'.split(
  '',
)
const charsG2 = '教室公園快樂朋友謝謝明天昨天吃飯跑步遊戲故事音樂運動健康安全觀察記錄社區家庭師長同儕輪流等待求助溝通整理書包'.split(
  '',
)
const strokeHints = {
  大: '像人張開雙手',
  小: '中間一豎兩點',
  山: '像三座山峰',
  水: '中間一豎有水紋',
  火: '像火焰往上',
  木: '有樹幹與樹枝',
  日: '像太陽窗口',
  月: '像彎彎的月亮',
  人: '兩筆撇捺',
  手: '五筆，像手掌',
  口: '正方形的嘴巴',
  目: '像眼睛',
  車: '中間有車廂',
  門: '像兩扇門',
}

function buildChars(grade) {
  const list = grade === 1 ? charsG1 : [...charsG1, ...charsG2].filter((c) => c.length === 1)
  const uniq = [...new Set(list)]
  const qs = []
  let n = 0
  for (const ch of uniq) {
    const wrong = shuffle(uniq.filter((c) => c !== ch)).slice(0, 3)
    const choices = shuffle([ch, ...wrong])
    qs.push(
      choice(
        `chars-${grade}-${++n}`,
        strokeHints[ch]
          ? `哪一個字「${strokeHints[ch]}」？`
          : `請選出「${ch}」字`,
        choices,
        choices.indexOf(ch),
        `正確是「${ch}」`,
      ),
    )
  }
  const pairs = [
    ['上', '下'],
    ['大', '小'],
    ['多', '少'],
    ['左', '右'],
    ['早', '晚'],
    ['出', '入'],
    ['父', '母'],
    ['子', '女'],
  ]
  for (const [a, b] of pairs) {
    const wrong = shuffle(uniq.filter((c) => c !== b)).slice(0, 3)
    const choices = shuffle([b, ...wrong])
    qs.push(
      choice(
        `chars-${grade}-opp-${a}`,
        `「${a}」的相反是哪一個？`,
        choices,
        choices.indexOf(b),
      ),
    )
  }
  const radicals = [
    ['河', '水'],
    ['花', '草'],
    ['跑', '足'],
    ['打', '手'],
    ['吃', '口'],
    ['林', '木'],
  ]
  for (const [word, part] of radicals) {
    const wrong = shuffle(['火', '山', '日', '人', '土', '月'].filter((x) => x !== part)).slice(
      0,
      3,
    )
    const choices = shuffle([part, ...wrong])
    qs.push(
      choice(
        `chars-${grade}-rad-${word}`,
        `「${word}」跟哪一部件比較像？`,
        choices,
        choices.indexOf(part),
      ),
    )
  }
  return qs.slice(0, 50)
}

// —— 閱讀 ——
function buildReading(grade) {
  const stories =
    grade === 1
      ? [
          {
            t: '小華早上起床，刷牙洗臉，背上書包去上學。',
            q: '小華早上要去哪裡？',
            a: '上學',
            w: ['公園', '超市', '海邊'],
          },
          {
            t: '貓咪在陽光下睡覺，老鼠輕輕走過。',
            q: '誰在睡覺？',
            a: '貓咪',
            w: ['老鼠', '小狗', '小鳥'],
          },
          {
            t: '下雨了，媽媽打開雨傘，牽著妹妹回家。',
            q: '天氣怎麼樣？',
            a: '下雨',
            w: ['出太陽', '颳風', '下雪'],
          },
          {
            t: '哥哥把積木堆很高，一下子倒下來，大家都笑了。',
            q: '積木後來怎麼了？',
            a: '倒下來',
            w: ['飛走了', '變大了', '不見了'],
          },
          {
            t: '老師說：「排隊要安靜。」小朋友都站好了。',
            q: '老師要大家怎麼做？',
            a: '安靜排隊',
            w: ['跑步', '大叫', '坐下睡覺'],
          },
        ]
      : [
          {
            t: '周末，爸媽帶小明去圖書館。小明選了一本橋梁書，坐在窗邊慢慢讀。回家路上，他跟媽媽分享故事裡的狐狸很聰明。',
            q: '小明在圖書館做什麼？',
            a: '看書',
            w: ['打球', '睡覺', '畫畫考試'],
          },
          {
            t: '下課時，兩位同學搶同一個球，後來他們決定輪流玩，每人五分鐘。',
            q: '他們最後怎麼解決？',
            a: '輪流玩',
            w: ['打架', '丟掉球', '不去玩'],
          },
          {
            t: '春天來了，校園的樹木長出新葉，花圃開滿小花，蜜蜂忙著採蜜。',
            q: '這段話主要在說什麼？',
            a: '春天的校園',
            w: ['冬天很冷', '晚上很黑', '教室很安靜'],
          },
        ]

  const qs = []
  let n = 0
  for (let round = 0; round < 10; round++) {
    for (const s of stories) {
      const choices = shuffle([s.a, ...s.w])
      qs.push(
        choice(
          `reading-${grade}-${++n}`,
          `${s.t}\n\n問：${s.q}`,
          choices,
          choices.indexOf(s.a),
        ),
      )
    }
  }
  const sentences = [
    ['我喜歡', '看書', '跑得很快', '是句子的哪一部分？（接在「我喜歡」後面較合適）', '看書'],
  ]
  const completions = [
    { p: '我每天___刷牙。', a: '都要', w: ['不要', '從來不', '忘記就'] },
    { p: '請___把門關上。', a: '輕輕', w: ['用力踢', '用跑的', '大叫著'] },
    { p: '弟弟比我___。', a: '小', w: ['天空', '雨傘', '教室'] },
    { p: '媽媽做的菜很___。', a: '好吃', w: ['跑步', '書包', '注音'] },
    { p: '我們要___等紅燈。', a: '耐心', w: ['衝過', '關閉', '丟掉'] },
  ]
  for (const c of completions) {
    for (let i = 0; i < 3; i++) {
      const choices = shuffle([c.a, ...c.w])
      qs.push(
        choice(
          `reading-${grade}-fill-${c.p}-${i}`,
          `選合適的詞：${c.p}`,
          choices,
          choices.indexOf(c.a),
        ),
      )
    }
  }
  void sentences
  return qs.slice(0, 45)
}

// —— 加減／位值 ——
function buildNumber(grade) {
  const qs = []
  let n = 0
  const max = grade === 1 ? 100 : 1000
  for (let i = 0; i < 25; i++) {
    const a = 10 + Math.floor(Math.random() * (grade === 1 ? 40 : 90))
    const b = 5 + Math.floor(Math.random() * (grade === 1 ? 30 : 80))
    const sum = a + b
    if (sum > max) continue
    const wrong = shuffle([
      sum + 1,
      sum - 1,
      sum + 10,
      Math.abs(a - b),
    ]).slice(0, 3)
    const choices = shuffle([String(sum), ...wrong.map(String)])
    qs.push(
      choice(
        `number-${grade}-add-${++n}`,
        `${a}＋${b}＝？`,
        choices,
        choices.indexOf(String(sum)),
      ),
    )
  }
  for (let i = 0; i < 20; i++) {
    let a = 20 + Math.floor(Math.random() * (grade === 1 ? 50 : 200))
    let b = 5 + Math.floor(Math.random() * (a - 4))
    const diff = a - b
    const wrong = shuffle([diff + 1, diff - 1, a + b, Math.abs(diff - 10)]).slice(
      0,
      3,
    )
    const choices = shuffle([String(diff), ...wrong.map(String)])
    qs.push(
      choice(
        `number-${grade}-sub-${++n}`,
        `${a}－${b}＝？`,
        choices,
        choices.indexOf(String(diff)),
      ),
    )
  }
  for (let i = 0; i < 12; i++) {
    const hundreds = grade === 1 ? 0 : 1 + Math.floor(Math.random() * 9)
    const tens = Math.floor(Math.random() * 9)
    const ones = Math.floor(Math.random() * 9)
    const num = hundreds * 100 + tens * 10 + ones
    if (num < 10) continue
    const place = grade === 1 || Math.random() > 0.5 ? 'tens' : 'hundreds'
    let prompt, ans
    if (place === 'tens' || hundreds === 0) {
      prompt = `${num} 的「十位」是幾？`
      ans = String(tens)
    } else {
      prompt = `${num} 的「百位」是幾？`
      ans = String(hundreds)
    }
    const wrong = shuffle(
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].filter((x) => x !== ans),
    ).slice(0, 3)
    const choices = shuffle([ans, ...wrong])
    qs.push(
      choice(`number-${grade}-place-${++n}`, prompt, choices, choices.indexOf(ans)),
    )
  }
  if (grade === 2) {
    for (let a = 2; a <= 9; a++) {
      for (let b = 2; b <= 5; b++) {
        const product = a * b
        const wrong = shuffle([
          product + a,
          product - 1,
          a + b,
          a * (b + 1),
        ]).slice(0, 3)
        const choices = shuffle([String(product), ...wrong.map(String)])
        qs.push(
          choice(
            `number-2-mul-${a}x${b}`,
            `${a}×${b}＝？`,
            choices,
            choices.indexOf(String(product)),
          ),
        )
      }
    }
  }
  return qs.slice(0, 55)
}

// —— 時鐘／時間 ——
function buildMeasure(grade) {
  const qs = []
  let n = 0
  for (let h = 1; h <= 12; h++) {
    for (const m of grade === 1 ? [0, 30] : [0, 15, 30, 45]) {
      const label =
        m === 0 ? `${h} 點整` : m === 30 ? `${h} 點 30 分` : `${h} 點 ${m} 分`
      const wrongM = shuffle(
        [0, 15, 30, 45, 10].filter((x) => x !== m),
      ).slice(0, 3)
      const choices = shuffle([
        label,
        ...wrongM.map((wm) =>
          wm === 0 ? `${h} 點整` : `${h} 點 ${wm} 分`,
        ),
      ])
      // unique choices
      const uniq = [...new Set(choices)]
      while (uniq.length < 4) uniq.push(`${h + 1} 點整`)
      const finalChoices = uniq.slice(0, 4)
      qs.push(
        choice(
          `measure-${grade}-time-${++n}`,
          `時針指 ${h}、分針指 ${m === 0 ? '12' : m === 30 ? '6' : m === 15 ? '3' : '9'}，現在幾點？`,
          finalChoices,
          finalChoices.indexOf(label),
        ),
      )
    }
  }
  const money = [
    [10, 5, 15],
    [50, 10, 60],
    [100, 50, 150],
    [20, 20, 40],
    [5, 5, 10],
    [100, 10, 110],
  ]
  for (const [a, b, sum] of money) {
    const wrong = shuffle([sum + 10, sum - 5, a, b]).slice(0, 3)
    const choices = shuffle([String(sum), ...wrong.map(String)])
    qs.push(
      choice(
        `measure-${grade}-money-${++n}`,
        `${a} 元＋${b} 元＝多少元？`,
        choices,
        choices.indexOf(String(sum)),
      ),
    )
  }
  const shapes = [
    ['圓形', '像球、像輪子，沒有角'],
    ['三角形', '有三個角、三邊'],
    ['正方形', '四邊一樣長，四個直角'],
    ['長方形', '對邊相等，四個直角'],
  ]
  if (grade === 2) {
    shapes.push(['正方體', '像骰子，每個面都是正方形'])
    shapes.push(['圓柱', '像罐頭，上下是圓形'])
  }
  for (const [name, hint] of shapes) {
    const wrong = shuffle(shapes.filter((s) => s[0] !== name))
      .slice(0, 3)
      .map((s) => s[0])
    const choices = shuffle([name, ...wrong])
    qs.push(
      choice(
        `measure-${grade}-shape-${name}`,
        `${hint}，這是什麼形狀？`,
        choices,
        choices.indexOf(name),
      ),
    )
  }
  for (let cm = 5; cm <= 40; cm += 5) {
    const m = cm / 100
    if (grade === 1) {
      const wrong = shuffle([cm + 1, cm - 1, cm + 5, cm * 2]).slice(0, 3)
      const choices = shuffle([String(cm), ...wrong.map(String)])
      qs.push(
        choice(
          `measure-1-len-${cm}`,
          `一支鉛筆大約 ${cm} 公分，正確數字是？`,
          choices,
          choices.indexOf(String(cm)),
        ),
      )
    } else {
      const ans = `${cm} 公分`
      const wrong = [`${cm} 公尺`, `${m} 公分`, `${cm * 10} 公分`]
      const choices = shuffle([ans, ...wrong])
      qs.push(
        choice(
          `measure-2-len-${cm}`,
          `哪一個長度寫法正確？（約 ${cm}cm）`,
          choices,
          choices.indexOf(ans),
        ),
      )
    }
  }
  return qs.slice(0, 50)
}

function expandScenario(island, grade, base) {
  const qs = []
  let n = 0
  for (let round = 0; round < 8; round++) {
    for (const b of base) {
      const choices = shuffle([b.a, ...b.w])
      qs.push({
        id: `${island}-${grade}-${++n}`,
        engine: 'scenario',
        prompt: b.p,
        choices,
        answerIndex: choices.indexOf(b.a),
        explain: b.e,
      })
    }
  }
  return qs.slice(0, 45)
}

function buildSafety(grade) {
  return expandScenario('safety', grade, [
    {
      p: '紅燈亮了，你要過马路時應該？',
      a: '停下來等待',
      w: ['快跑過去', '跟著大人衝', '閉眼走'],
      e: '紅燈停、綠燈行。',
    },
    {
      p: '過马路要走哪裡最安全？',
      a: '斑馬線／行人穿越道',
      w: ['車縫中間', '圓環中央', '高速公路'],
      e: '走人行穿越道最安全。',
    },
    {
      p: '在校園走廊應該怎麼走？',
      a: '靠右慢慢走',
      w: ['跑步追逐', '推擠同學', '滑跪前進'],
      e: '走廊不奔跑，避免碰撞。',
    },
    {
      p: '陌生人給糖果要你跟他走，你要？',
      a: '拒絕並找老師或家長',
      w: ['跟他走', '收下並保密', '自己去找他'],
      e: '不跟陌生人走，立刻求助。',
    },
    {
      p: '地震演習時，教室裡要先？',
      a: '趴下、掩護、穩住',
      w: ['衝出門外', '站在窗邊看', '大叫不動'],
      e: '先保護頭，聽老師指示。',
    },
    {
      p: '騎腳踏車在社區，要記得？',
      a: '戴安全帽、注意來車',
      w: ['兩人共乘把手', '邊騎邊滑手機', '逆向超快衝'],
      e: '安全裝備與禮讓很重要。',
    },
  ])
}

function buildNature(grade) {
  const qs = []
  const items = [
    ['春天', '花開、新葉', ['下雪很厚', '樹葉全黃掉光', '天黑最長']],
    ['夏天', '天氣炎熱、白天長', ['霜降結冰', '楓葉變紅為主', '穿很厚外套']],
    ['秋天', '葉子變色、涼爽', ['梅雨整月', '西瓜季最盛', '河水結厚冰']],
    ['冬天', '天氣較冷', ['蟬鳴整天', '芒果盛產', '短袖最剛好']],
    ['太陽', '帶來光和熱', ['只有晚上出現', '會下雨', '是一顆種子']],
    ['風', '空氣在流動', ['是一種石頭', '只在水裡', '是動物叫聲']],
    ['影子', '光被擋住形成', ['晚上比較多太陽', '是水做的', '會自己走路']],
    ['種子', '可以發芽長成植物', ['是動物骨頭', '只會飛', '是雲的名字']],
    ['蝴蝶', '昆蟲，會飛', ['生活在深海', '是一種樹', '四隻腳的哺乳類']],
    ['魚', '用腮呼吸、住在水裡', ['會開花', '用肺在天空飛', '長在土裡']],
  ]
  let n = 0
  for (let r = 0; r < 5; r++) {
    for (const [topic, ans, wrong] of items) {
      const choices = shuffle([ans, ...wrong])
      qs.push(
        choice(
          `nature-${grade}-${++n}`,
          `關於「${topic}」，哪一個敘述較正確？`,
          choices,
          choices.indexOf(ans),
        ),
      )
    }
  }
  if (grade === 2) {
    const observe = [
      {
        p: '觀察紀錄時，最好寫下？',
        a: '日期、看到的現象',
        w: ['隨便亂畫就好', '只寫同學名字', '抄答案不看'],
      },
    ]
    for (const o of observe) {
      for (let i = 0; i < 5; i++) {
        const choices = shuffle([o.a, ...o.w])
        qs.push(
          choice(`nature-2-obs-${i}`, o.p, choices, choices.indexOf(o.a)),
        )
      }
    }
  }
  return qs.slice(0, 50)
}

function buildHealth(grade) {
  const qs = []
  let n = 0
  const orders = [
    {
      prompt: '正確洗手順序：把步驟排好',
      items: ['濕手', '抹肥皂', '搓洗', '沖淨', '擦乾'],
    },
    {
      prompt: '起床後潔牙順序',
      items: ['拿牙刷', '擠牙膏', '刷牙', '漱口', '洗淨牙刷'],
    },
  ]
  for (let r = 0; r < 8; r++) {
    for (const o of orders) {
      qs.push({
        id: `health-${grade}-order-${++n}`,
        engine: 'order',
        prompt: o.prompt,
        items: shuffle(o.items),
        correctOrder: o.items,
      })
    }
  }
  const habits = [
    {
      p: '飯前應該？',
      a: '洗手',
      w: ['先大哭', '不洗手就抓', '用髒手擦嘴'],
    },
    {
      p: '每天刷牙建議？',
      a: '早晚都刷',
      w: ['一星期一次', '從不刷', '只刷前面牙齒隨便'],
    },
    {
      p: '覺得身體不舒服要？',
      a: '告訴大人',
      w: ['自己忍著不上學也不說', '亂吃藥', '繼續劇烈運動'],
    },
    {
      p: '運動後流汗，可以？',
      a: '擦汗並補充水',
      w: ['立刻喝冰汽水猛灌', '穿濕衣服吹冷氣猛吹', '完全不休息'],
    },
  ]
  for (let r = 0; r < 6; r++) {
    for (const h of habits) {
      const choices = shuffle([h.a, ...h.w])
      qs.push(
        choice(
          `health-${grade}-habit-${++n}`,
          h.p,
          choices,
          choices.indexOf(h.a),
          undefined,
          'scenario',
        ),
      )
    }
  }
  return qs.slice(0, 45)
}

function buildSelfcare(grade) {
  return expandScenario('selfcare', grade, [
    {
      p: '明天要上學，今晚書包應該？',
      a: '自己檢查並整理好',
      w: ['丟在門口不管', '全部倒在床上睡', '叫同學隔天借'],
      e: '養成自己整理書包的習慣。',
    },
    {
      p: '聯絡簿寫完了要？',
      a: '放回書包並交給家長看',
      w: ['撕掉', '藏起來不給看', '丟在教室'],
      e: '聯絡簿是家和學校的橋樑。',
    },
    {
      p: '吃完點心，餐具水壺要？',
      a: '清洗乾淨',
      w: ['丟在沙發', '不洗放回書包', '送給陌生人'],
      e: '自己的東西自己清。',
    },
    {
      p: '功課還沒寫完，想先玩遊戲，較好的做法是？',
      a: '先寫完再玩',
      w: ['一直玩不管', '謊稱寫完', '把功課丟掉'],
      e: '先完成責任再玩。',
    },
    {
      p: '廁所使用後要？',
      a: '洗手並保持整潔',
      w: ['不沖水就走', '在牆上亂畫', '把紙扔滿地'],
      e: '衛生習慣保護自己也尊重別人。',
    },
    {
      p: '找不到橡皮擦時？',
      a: '冷靜找過或跟老師說',
      w: ['大哭怪別人', '搶同學的', '把桌子掀翻'],
      e: '用合適方法解決問題。',
    },
  ])
}

function buildMood(grade) {
  return expandScenario('mood', grade, [
    {
      p: '和好朋友搶同一個玩具，你可以？',
      a: '商量輪流玩',
      w: ['搶過來打人', '罵很難聽的話', '偷偷藏起來永不給'],
      e: '輪流與商量比較好。',
    },
    {
      p: '考試考不好很難過，可以？',
      a: '告訴信任的大人並再練習',
      w: ['撕考卷發脾氣砸東西', '再也不學習', '欺負分數高的同學'],
      e: '情緒可以說出來，再一起想辦法。',
    },
    {
      p: '想加入別人的遊戲，較好的說法是？',
      a: '請問我可以一起玩嗎？',
      w: ['直接搶器材', '大叫你們必須讓我', '生悶氣不說話卻推人'],
      e: '用有禮貌的話表達。',
    },
    {
      p: '被同學誤會時？',
      a: '冷靜說明或請老師幫忙',
      w: ['立刻動手', '整天不說話報復', '在背後說壞話'],
      e: '溝通與求助比打架好。',
    },
    {
      p: '輪到別人發言時，你應該？',
      a: '安靜聽完再舉手',
      w: ['一直插話', '嘲笑他', '走开大吵'],
      e: '學會等待與尊重。',
    },
    {
      p: '開心的時候可以？',
      a: '分享給家人朋友',
      w: ['故意弄疼別人才開心', '破壞東西', '不理會任何人永遠'],
      e: '正向情緒也可以好好表達。',
    },
  ])
}

writeIsland('zhuyin', buildZhuyin(1), buildZhuyin(2))
writeIsland('chars', buildChars(1), buildChars(2))
writeIsland('reading', buildReading(1), buildReading(2))
writeIsland('number', buildNumber(1), buildNumber(2))
writeIsland('measure', buildMeasure(1), buildMeasure(2))
writeIsland('safety', buildSafety(1), buildSafety(2))
writeIsland('nature', buildNature(1), buildNature(2))
writeIsland('health', buildHealth(1), buildHealth(2))
writeIsland('selfcare', buildSelfcare(1), buildSelfcare(2))
writeIsland('mood', buildMood(1), buildMood(2))
