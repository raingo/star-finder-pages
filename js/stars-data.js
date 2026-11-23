/**
 * Prominent Stars, Constellations, and Astronomical Lore Database
 * Bilingual English and Chinese (星空识星恒星与星座数据库)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StarsData = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STARS = [
    {
      id: 'sirius',
      name: 'Sirius',
      nameCn: '天狼星',
      pinyin: 'Tiānláng Xīng',
      bayer: 'α CMa',
      constellation: 'Canis Major',
      constellationCn: '大犬座',
      ra: 6.7525,
      dec: -16.7161,
      mag: -1.46,
      distanceLy: 8.6,
      spectralType: 'A1V + DA2',
      color: '#c8dcff',
      summaryEn: 'Brightest star in Earth’s night sky; a binary system with a white dwarf companion.',
      summaryCn: '全天夜空最明亮的恒星；拥有一颗“小狗”白矮星伴星的双星系统。',
      astrophysics: {
        en: [
          'Apparent visual magnitude of -1.46, nearly twice as bright as Canopus.',
          'Located only 8.6 light-years away, making it the 7th closest star system to the Sun.',
          'Sirius A is twice as massive as the Sun and 25 times more luminous.',
          'Orbited by Sirius B ("The Pup"), the first white dwarf star ever discovered.'
        ],
        zh: [
          '视星等达 -1.46 等，亮度几乎是第二亮的老人星的两倍。',
          '距离太阳系仅 8.6 光年，是距离地球第七近的恒星系统。',
          '天狼星 A 的质量约为太阳的 2 倍，光度约为太阳的 25 倍。',
          '天狼星 B（俗称“小狗”）是人类历史上确认发现的第一颗白矮星。'
        ]
      },
      mythology: {
        western: {
          en: 'Named from Greek "Seirios" (glowing/scorcher). Ancient Greeks and Romans associated its heliacal rising with the sweltering heat of the "Dog Days" of summer.',
          zh: '名称源自希腊语“Seirios”（炽热耀眼）。古希腊与罗马人将其与夏季最酷热的“三伏犬日”紧密联系在一起。'
        },
        chinese: {
          en: 'In Chinese astronomy, it belongs to the Well Mansion (井宿) and was viewed as a wolf representing invasion, military unrest, and border warfare. Ancient emperors erected the celestial Bow and Arrow (弧矢) aimed directly at Sirius to protect the realm.',
          zh: '中国传统天文学中属于井宿，代表边疆与战争凶兆。苏轼名句“会挽雕弓如满月，西北望，射天狼”中的“天狼”即指此星。古人在其东南设立“弧矢”九星，弓箭直指天狼以震慑侵略。'
        }
      }
    },
    {
      id: 'polaris',
      name: 'Polaris',
      nameCn: '北极星 (勾陈一)',
      pinyin: 'Běijí Xīng',
      bayer: 'α UMi',
      constellation: 'Ursa Minor',
      constellationCn: '小熊座',
      ra: 2.5303,
      dec: 89.2641,
      mag: 1.98,
      distanceLy: 433,
      spectralType: 'F7Ib',
      color: '#fff8e8',
      summaryEn: 'Current northern pole star; marks true celestial north within 0.7° of the celestial pole.',
      summaryCn: '当前地轴北极指向的基准星，距离真正北天极仅约 0.7°。',
      astrophysics: {
        en: [
          'Multiple star system dominated by Polaris Aa, a pulsating yellow supergiant Classical Cepheid variable.',
          'Luminosity is approximately 2,500 times that of our Sun.',
          'Its altitude in the night sky equals the observer’s northern latitude almost exactly.',
          'Precession of Earth’s axis means Vega and Thuban have served or will serve as pole stars across millennia.'
        ],
        zh: [
          '由黄超巨星勾陈一 Aa 主导的多星系统，是一颗经典的造父变星。',
          '辐射光度约为太阳的 2500 倍。',
          '在北半球的地平高度角几乎严格等于观测者所处的地理纬度，是天然的定位罗盘。',
          '因岁差效应，地轴北极随2.6万年周期转动，古时织女星与右枢曾是北极星。'
        ]
      },
      mythology: {
        western: {
          en: 'Known as the North Star, Lodestar, or Cynosura, it has guided sailors and explorers across the northern hemisphere for centuries.',
          zh: '在西方被称为“北极星”或“领航星”，千百年来一直是北半球航海家穿越大洋最信赖的指南灯塔。'
        },
        chinese: {
          en: 'In Chinese cosmology, Polaris resides in the Purple Forbidden Enclosure (紫微垣) as the Emperor of the Heavens (勾陈一 / 紫微帝星), symbolizing absolute harmony and sovereign cosmic order.',
          zh: '居于三垣之核心“紫微垣”，被奉为“紫微帝星”或勾陈一，象征天帝与至高皇权，诸星环绕朝拱，所谓“为政以德，譬如北辰，居其所而众星共之”。'
        }
      }
    },
    {
      id: 'betelgeuse',
      name: 'Betelgeuse',
      nameCn: '参宿四',
      pinyin: 'Shēnxiù Sì',
      bayer: 'α Ori',
      constellation: 'Orion',
      constellationCn: '猎户座',
      ra: 5.9195,
      dec: 7.4071,
      mag: 0.50,
      distanceLy: 548,
      spectralType: 'M1-2Ia-ab',
      color: '#ff7a59',
      summaryEn: 'Colossal red supergiant nearing the end of its life; destined to explode as a supernova.',
      summaryCn: '寿命已入晚期的红超巨星，直径超越木星轨道，随时可能爆发为超新星。',
      astrophysics: {
        en: [
          'Radius is ~764 times solar radius; if placed at the Sun’s center, its surface would engulf Mars and approach Jupiter.',
          'Semi-regular pulsating variable star exhibiting dramatic surface convection cells and dust ejections.',
          'Experienced the "Great Dimming" in late 2019 due to a massive ejection of gas forming an obscuring dust cloud.',
          'Will end its life in a core-collapse Type II supernova within the next 100,000 years.'
        ],
        zh: [
          '半径约为太阳的 764 倍；若置于太阳系中心，其边缘将吞噬水星、金星、地球与火星，逼近木星轨道。',
          '半规则脉动红超巨星，表面有巨大的热对流气泡与尘埃抛射。',
          '2019年末曾发生举世瞩目的“大变暗”事件，系表面剧烈喷发的气体冷却凝结成尘埃云遮挡所致。',
          '核心即将耗尽核燃料，将在未来十万年内以 II 型超新星爆发终结生命。'
        ]
      },
      mythology: {
        western: {
          en: 'Represents the right shoulder of the hunter Orion. The Arabic name "Ibt al-Jawzā’" translates to "Armpit of the Central One".',
          zh: '代表猎户俄里翁右肩。阿拉伯语原名意为“巨人之腋”，常与明亮的参宿七相对照。'
        },
        chinese: {
          en: 'One of the primary stars of the Shen Mansion (参宿). Ancient Chinese folklore contrasts Shen (Orion) and Shang (Scorpius): brothers who quarrel and were banished to opposite skies, never to see each other.',
          zh: '二十八宿中西方白虎“参宿”的主星之一。中国古人以“人生不相见，动如参与商”形容亲友隔绝，源于高辛氏二子阏伯与实沈不睦，帝喾将他们分封商丘与大夏，主商星（心宿）与参星，东西永不相见。'
        }
      }
    },
    {
      id: 'rigel',
      name: 'Rigel',
      nameCn: '参宿七',
      pinyin: 'Shēnxiù Qī',
      bayer: 'β Ori',
      constellation: 'Orion',
      constellationCn: '猎户座',
      ra: 5.2423,
      dec: -8.2016,
      mag: 0.13,
      distanceLy: 860,
      spectralType: 'B8Ia',
      color: '#bbd7ff',
      summaryEn: 'Luminous blue supergiant illuminating Orion’s left foot; 120,000 times brighter than the Sun.',
      summaryCn: '猎户座最明亮的恒星，亮度达太阳12万倍的蓝超巨星。',
      astrophysics: {
        en: [
          'Blistering surface temperature of 12,100 K, radiating intense ultraviolet and visible starlight.',
          'Intrinsic luminosity is between 61,500 and 363,000 times that of the Sun (best estimate ~120,000 L☉).',
          'Part of a quadruple star system with faint stellar companions.',
          'Heavier than 21 solar masses, it will also end its life in a spectacular supernova.'
        ],
        zh: [
          '表面温度高达 12,100 K，放射出耀眼的蓝白光辉与强烈紫外辐射。',
          '绝对光度高达太阳的 12 万倍，是猎户座最亮的星。',
          '属于四合星系统，主星有一对肉眼难辨的伴星。',
          '质量超太阳 21 倍，未来同样将以核心坍缩的超新星爆发谢幕。'
        ]
      },
      mythology: {
        western: {
          en: 'Derived from Arabic "Rijl Jauzah al Yusrā" meaning "Left Leg of the Giant". Marks the stepped forward foot of Orion.',
          zh: '名称源自阿拉伯语“巨人之左足”，标志着猎户俄里翁向前踏出迎战金牛的左脚。'
        },
        chinese: {
          en: 'Belongs to the Shen Mansion (参宿). Formed the majestic southern anchor of the White Tiger constellation.',
          zh: '属于参宿，与参宿四交相辉映，是冬季夜空中最引人注目的璀璨宝石之一。'
        }
      }
    },
    {
      id: 'vega',
      name: 'Vega',
      nameCn: '织女一',
      pinyin: 'Zhīnǚ Yī',
      bayer: 'α Lyr',
      constellation: 'Lyra',
      constellationCn: '天琴座',
      ra: 18.6156,
      dec: 38.7836,
      mag: 0.03,
      distanceLy: 25.0,
      spectralType: 'A0V',
      color: '#d4e6ff',
      summaryEn: 'Brilliant sapphire of the Summer Triangle; the historical photometric zero-point standard.',
      summaryCn: '夏季大三角的耀眼蓝白星，天文学历史上视星等 0 度的基准校准星。',
      astrophysics: {
        en: [
          'Fifth brightest star in the night sky and second brightest in the northern celestial sphere.',
          'Historically used as the baseline definition of zero magnitude for the photometric system.',
          'Spins extremely rapidly (rotation velocity ~236 km/s at the equator), causing it to bulge outward at the equator.',
          'Surrounded by a prominent circumstellar debris disk, indicative of ongoing planet formation.'
        ],
        zh: [
          '全天第五亮星，北天第二亮星。',
          '长期作为天文测光系统中“视星等 0 等”的标准基准星。',
          '自转速度极其迅猛（赤道线速度达 236 km/s），呈显著扁椭球形，赤道向外隆起。',
          '周围拥有一个著名的星周岩屑盘，蕴藏着系外行星孕育演化的线索。'
        ]
      },
      mythology: {
        western: {
          en: 'Represents the celestial harp (Lyre) played by Orpheus, whose music could charm beasts, trees, and stones.',
          zh: '代表俄耳甫斯的七弦琴（天琴），其仙乐能令百兽驯服、草木起舞，甚至打动冥王拯救欧律狄刻。'
        },
        chinese: {
          en: 'The immortal Weaver Girl (织女) of classic Chinese folklore. Daughter of Heaven who fell in love with Cowherd (Altair), separated by the Silver River (Milky Way) and reunited each year on Qixi by a bridge of magpies.',
          zh: '中国千古流传“牛郎织女”神话的主角织女星。天帝幼女，主管织造云彩锦缎，与凡间牛郎相恋，却被王母娘娘以银河相隔，每年七夕群鹊搭桥方得一渡相会。'
        }
      }
    },
    {
      id: 'altair',
      name: 'Altair',
      nameCn: '牛郎星 (河鼓二)',
      pinyin: 'Niúláng Xīng',
      bayer: 'α Aql',
      constellation: 'Aquila',
      constellationCn: '天鹰座',
      ra: 19.8464,
      dec: 8.8683,
      mag: 0.76,
      distanceLy: 16.7,
      spectralType: 'A7V',
      color: '#e8f0ff',
      summaryEn: 'Rapidly spinning star completing a rotation in just 9 hours; flattens significantly at its poles.',
      summaryCn: '自转极快的白色主序星，仅需约9小时自转一圈，赤道剧烈凸起。',
      astrophysics: {
        en: [
          'Located only 16.7 light-years from Earth, it is one of the closest stars visible to the naked eye.',
          'Rotates at an astonishing 286 km/s (nearly 90% of its breakup velocity), squishing its equatorial diameter by 20%.',
          'One of the first stars whose surface was directly imaged by astronomical optical interferometry.',
          'Southern vertex of the famous Summer Triangle asterism.'
        ],
        zh: [
          '距离地球仅 16.7 光年，是肉眼可见最近的恒星之一。',
          '赤道自转速度高达 286 km/s，达到恒星离心瓦解速度的近90%，导致南北极扁平、赤道直径膨胀20%以上。',
          '人类首批使用光学干涉仪直接对其表面细节成像的恒星之一。',
          '夏季大三角的南端顶点。'
        ]
      },
      mythology: {
        western: {
          en: 'Arabic name "an-nasr at-ta’ir" translates to "The Flying Eagle". Represents the bird of Zeus carrying thunderbolts.',
          zh: '阿拉伯语原名意为“飞翔之鹰”，在希腊神话中是宙斯化身携雷霆的神鹰。'
        },
        chinese: {
          en: 'The faithful Cowherd (牵牛星 / 河鼓二), flanked on both sides by his two young children (河鼓一 and 河鼓三, carried in baskets on a pole), gazing longingly across the Milky Way toward Weaver Girl.',
          zh: '牛郎星，两侧有河鼓一与河鼓三宛如扁担挑着一双儿女，隔着银河长年深情凝望对岸的织女星。'
        }
      }
    },
    {
      id: 'deneb',
      name: 'Deneb',
      nameCn: '天津四',
      pinyin: 'Tiānjīn Sì',
      bayer: 'α Cyg',
      constellation: 'Cygnus',
      constellationCn: '天鹅座',
      ra: 20.6905,
      dec: 45.2803,
      mag: 1.25,
      distanceLy: 2615,
      spectralType: 'A2Ia',
      color: '#e4ecff',
      summaryEn: 'Monster white hypergiant; shines brightly despite being over 2,600 light-years distant.',
      summaryCn: '远在 2600 多光年外的白超巨星，发光能力是太阳的近20万倍。',
      astrophysics: {
        en: [
          'One of the most luminous stars known in the local Milky Way, shining with ~196,000 times the Sun’s luminosity.',
          'Despite its enormous distance of ~2,600 light-years, it remains the 19th brightest star in our night sky.',
          'Marks the tail of the celestial Swan (Northern Cross).',
          'Prototype of Alpha Cygni variable stars, pulsating with non-radial ripples across its surface.'
        ],
        zh: [
          '银河系局部最明亮的超巨星之一，光度约等于太阳的 20 万倍。',
          '尽管远在 2600 多光年之外，依然位列全天第 19 亮星。',
          '天鹅座（北十字）的尾端，也是夏季大三角的北方顶点。',
          '天鹅座α型变星的代表原型，巨大星体表面持续产生复杂的非径向脉动。'
        ]
      },
      mythology: {
        western: {
          en: 'Arabic "Dhanab" means "Tail", referring to the tail of Cygnus the Swan that Zeus transformed into.',
          zh: '源自阿拉伯语“Dhanab”（尾巴），即神话中宙斯化身的天鹅之尾。'
        },
        chinese: {
          en: 'In Chinese astronomy, Deneb is the premier star of "Tianjin" (天津) meaning "Celestial Ford", the grand ferry terminal and bridge across the Milky Way where the magpie bridge convenes for Qixi.',
          zh: '天津四位于二十八宿危宿之北，意为“天河之渡口”，是横跨银河的九座仙桥之首。传说七夕鹊桥便依天津渡口搭起，助牛郎织女相聚。'
        }
      }
    },
    {
      id: 'procyon',
      name: 'Procyon',
      nameCn: '南河三',
      pinyin: 'Nánhé Sān',
      bayer: 'α CMi',
      constellation: 'Canis Minor',
      constellationCn: '小犬座',
      ra: 7.6528,
      dec: 5.2250,
      mag: 0.38,
      distanceLy: 11.5,
      spectralType: 'F5IV-V',
      color: '#fff5ea',
      summaryEn: 'Close neighbor to the Sun and key vertex of the Winter Triangle; orbited by a white dwarf companion.',
      summaryCn: '距太阳系仅11.5光年的邻近恒星，冬季大三角的东方顶点。',
      astrophysics: {
        en: [
          'Subgiant star evolving off the main sequence, glowing with 7 times solar luminosity.',
          'Located only 11.46 light-years from Earth.',
          'Has a faint white dwarf companion (Procyon B) orbiting every 40.8 years.',
          'Rises in the night sky just before Sirius, earning its ancient Greek name.'
        ],
        zh: [
          '正脱离主序向亚巨星演化的黄白星，光度约为太阳的 7 倍。',
          '距离地球仅 11.46 光年，是地球近邻之一。',
          '拥有一颗周期 40.8 年的白矮星伴星（南河三 B）。',
          '在夜空中升起时间略早于天狼星，古希腊人因此为其得名。'
        ]
      },
      mythology: {
        western: {
          en: 'Greek "Prokyon" translates to "Before the Dog", referring to its rising ahead of the Dog Star (Sirius).',
          zh: '古希腊语意为“在犬之前”，因其在北纬地区总比天狼星更早跃出地平线。'
        },
        chinese: {
          en: 'Chinese name Nanhe (南河) means "Southern River", positioned along the celestial river representing imperial border garrisons.',
          zh: '居于井宿，名“南河”，与“北河”（北河二、三）遥相对应，象征天河两侧的关隘守卫。'
        }
      }
    },
    {
      id: 'arcturus',
      name: 'Arcturus',
      nameCn: '大角星',
      pinyin: 'Dàjiǎo Xīng',
      bayer: 'α Boo',
      constellation: 'Boötes',
      constellationCn: '牧夫座',
      ra: 14.2610,
      dec: 19.1824,
      mag: -0.05,
      distanceLy: 36.7,
      spectralType: 'K1.5III',
      color: '#ffc988',
      summaryEn: 'Fourth brightest star in the night sky; ancient orange giant rushing past our galaxy’s plane.',
      summaryCn: '全天第四亮星，北天第一亮星；正在以极高速穿过银道面的古老橙巨星。',
      astrophysics: {
        en: [
          'Fourth brightest star in Earth’s night sky and brightest in the northern celestial hemisphere.',
          'An orange giant ~25 times wider than the Sun, shining with 170 times solar luminosity.',
          'Has an unusually high proper motion, traversing 1 degree of sky every 1,500 years.',
          'Likely an ancient star originating from an accreted dwarf galaxy (the Arcturus moving group).'
        ],
        zh: [
          '全天第四明亮的恒星，北半球夜空第一亮星。',
          '直径约为太阳的 25 倍，光度为太阳的 170 倍的橙巨星。',
          '拥有极高自行速度，每1500年便在星空移动约月球视直径（0.5°）的两倍。',
          '研究表明其可能源自一处数十亿年前被银河系吞并的远古矮星系（大角星流）。'
        ]
      },
      mythology: {
        western: {
          en: 'From Greek "Arktouros" meaning "Guardian of the Bear", following Ursa Major across the celestial dome.',
          zh: '源于希腊语“大熊卫士”，因其在夜空中始终紧紧跟随在大熊座之后而得名。'
        },
        chinese: {
          en: 'In Chinese astronomy, Arcturus is "Dajiao" (大角) meaning "The Great Horn", historically revered as the seat of the celestial throne (天王之座) and guardian horn of the Blue Dragon.',
          zh: '二十八宿之东方青龙角宿的主星与天王座。“大角”意为青龙两角之雄伟栋梁，被尊为天王帝席，《史记·天官书》载“大角者，天王帝廷”。顺着北斗七星勺柄弧线延伸，即“斗柄指东，天下皆春”的大角星。'
        }
      }
    },
    {
      id: 'capella',
      name: 'Capella',
      nameCn: '五车二',
      pinyin: 'Wǔchē Èr',
      bayer: 'α Aur',
      constellation: 'Auriga',
      constellationCn: '御夫座',
      ra: 5.2782,
      dec: 45.9980,
      mag: 0.08,
      distanceLy: 42.9,
      spectralType: 'G3III + G1III',
      color: '#fff0cf',
      summaryEn: 'Golden jewel of Auriga; a complex quadruple system anchored by two twin yellow giant stars.',
      summaryCn: '御夫座的金黄明珠；由两颗巨大黄色巨星主导的四合星系统。',
      astrophysics: {
        en: [
          'Sixth brightest star in the night sky and third brightest in the northern celestial hemisphere.',
          'A quadruple star system consisting of two pairs of binary stars: two giant G-type stars and two faint red dwarfs.',
          'The primary giants each have masses roughly 2.5 times that of the Sun.',
          'Radiates an aggregate luminosity approximately 150 times that of the Sun.'
        ],
        zh: [
          '全天第六亮星，北半球第三亮星。',
          '四合星系统，由两对双星组成：核心是两颗巨大的黄色G型巨星，外围还有一对红矮星伴星。',
          '两颗主巨星质量各约为太阳的 2.5 倍。',
          '总辐射光度约为太阳的 150 倍。'
        ]
      },
      mythology: {
        western: {
          en: 'Latin name means "Little She-Goat", representing Amalthea, the goat who suckled baby Zeus on Mount Ida.',
          zh: '拉丁语意为“小母羊”，代表在克里特岛伊达山用羊乳哺育襁褓中宙斯的神羊阿玛尔忒亚。'
        },
        chinese: {
          en: 'Belongs to the Net Mansion (毕宿) as the second star of "Wuche" (五车), the Five Imperial Chariots patrolling the realm.',
          zh: '属于毕宿，为“五车”第二星。象征天帝的五辆皇家战车车队，主巡查天界、储备粮草。'
        }
      }
    },
    {
      id: 'aldebaran',
      name: 'Aldebaran',
      nameCn: '毕宿五',
      pinyin: 'Bìxiù Wǔ',
      bayer: 'α Tau',
      constellation: 'Taurus',
      constellationCn: '金牛座',
      ra: 4.5987,
      dec: 16.5093,
      mag: 0.85,
      distanceLy: 65.3,
      spectralType: 'K5III',
      color: '#ffb56c',
      summaryEn: 'The fiery red Eye of the Bull; ancient royal star marking the head of Taurus.',
      summaryCn: '金牛喷火愤怒的红眼睛，古代波斯四大王星之一。',
      astrophysics: {
        en: [
          'Red-orange giant star that has exhausted hydrogen in its core and expanded to 44 times the solar diameter.',
          'Appears to sit within the Hyades star cluster, but is actually a foreground star only half as distant.',
          'Radiates more than 400 times the visual luminosity of the Sun.',
          'Pioneer 10 spacecraft is currently coasting in the general direction of Aldebaran, arriving in 2 million years.'
        ],
        zh: [
          '已耗尽核心氢燃料的红橙巨星，体积极度膨胀至太阳直径的 44 倍。',
          '视线中恰好位于毕星团前沿，但实际距离仅 65 光年，是毕星团距离的一半。',
          '辐射光度超太阳 400 倍以上。',
          '先驱者10号无人探测器正朝着毕宿五方向漫长漂移，预计200万年后抵达其附近。'
        ]
      },
      mythology: {
        western: {
          en: 'From Arabic "Al Dabaran" meaning "The Follower", because it appears to follow the Pleiades (Seven Sisters) across the sky.',
          zh: '阿拉伯语意为“追随者”，因其每夜总是紧随着昴星团（七姐妹）东升西落。'
        },
        chinese: {
          en: 'The premier star of the Net Mansion (毕宿). In Chinese tradition, it was known as the "Celestial Gate" and linked to rainfall predictions ("月离于毕，俾滂沱兮").',
          zh: '西方白虎毕宿主星。《诗经》云“月离于毕，俾滂沱兮”，古人认为月亮运行经过毕宿五时，天将降倾盆暴雨，故将其视为主天象阴晴与边疆安定的重要天星。'
        }
      }
    },
    {
      id: 'spica',
      name: 'Spica',
      nameCn: '角宿一',
      pinyin: 'Jiǎoxiù Yī',
      bayer: 'α Vir',
      constellation: 'Virgo',
      constellationCn: '室女座',
      ra: 13.4199,
      dec: -11.1613,
      mag: 0.98,
      distanceLy: 250,
      spectralType: 'B1III-IV + B2V',
      color: '#9ebdff',
      summaryEn: 'Intense blue binary pair orbiting so closely they are distorted into eggs by mutual gravity.',
      summaryCn: '东方青龙第一宿的领头星，两颗超近距离公转的炙热蓝白双星。',
      astrophysics: {
        en: [
          'Spectroscopic binary and rotating ellipsoidal variable; stars orbit each other in only 4.01 days.',
          'Tidal forces from their proximity distort both stars into egg-shaped ellipsoids.',
          'Combined luminosity is over 12,000 times that of the Sun.',
          'Used by ancient astronomer Hipparchus to discover the precession of the equinoxes.'
        ],
        zh: [
          '分光双星与旋转椭球变星，两颗高温蓝白星以仅4.01天的极速相互环绕公转。',
          '由于极度接近的引力潮汐，两颗恒星被拉扯扭曲成两枚旋转的椭球形“蛋”。',
          '合并不透光度超过太阳 1.2 万倍。',
          '古希腊天文学家喜帕恰斯正是通过对比角宿一的位置变化，首次发现了地球的岁差运动。'
        ]
      },
      mythology: {
        western: {
          en: 'Latin name means "Ear of Grain", held in the hand of the maiden Astraea / Demeter, goddess of the harvest.',
          zh: '拉丁语意为“麦穗”，代表农业与丰收女神德墨忒尔手中托举的金黄麦穗。'
        },
        chinese: {
          en: 'The first star of the first mansion of Chinese astronomy: Horn Mansion (角宿) of the Azure Dragon of the East. Its rising marked the arrival of spring and agricultural awakening.',
          zh: '二十八宿第一宿“角宿”之首，代表东方青龙之双角。角宿一在春季黄昏跃出东方地平线，即民间俗称“二月二，龙抬头”，标志春回大地、农耕伊始。'
        }
      }
    },
    {
      id: 'antares',
      name: 'Antares',
      nameCn: '心宿二 (大火)',
      pinyin: 'Xīnxiù Èr',
      bayer: 'α Sco',
      constellation: 'Scorpius',
      constellationCn: '天蝎座',
      ra: 16.4901,
      dec: -26.4320,
      mag: 1.06,
      distanceLy: 550,
      spectralType: 'M1.5Iab',
      color: '#ff6644',
      summaryEn: 'The beating crimson heart of Scorpius; ancient Chinese fire star "Dahuo" of the poetic ode "Qi Yue Liu Huo".',
      summaryCn: '天蝎座的跳动红宝石心脏，中国古称“大火星”，《诗经》名句“七月流火”所指之星。',
      astrophysics: {
        en: [
          'Supergiant star with a diameter ~700 times that of the Sun.',
          'Surface glows at a cool 3,400 K, radiating intense infrared and deep ruby light.',
          'Has a hot blue-green companion star (Antares B) visible through large telescopes.',
          'Surrounded by the colorful Rho Ophiuchi interstellar dust reflection nebula complex.'
        ],
        zh: [
          '巨大的红超巨星，直径约为太阳的 700 倍。',
          '表面温度仅约 3400 K，呈现如火焰般深红的色彩。',
          '拥有一颗高温蓝绿色伴星（心宿二 B）。',
          '被著名的蛇夫座ρ彩虹反射星云与暗星云团重重包围。'
        ]
      },
      mythology: {
        western: {
          en: 'Greek "Anti-Ares" means "Rival of Mars", due to its vivid crimson color competing with the Red Planet.',
          zh: '希腊语“Anti-Ares”意为“战神阿瑞斯（火星）的宿敌”，因其深红炽热光芒常与天宇游弋的火星争艳。'
        },
        chinese: {
          en: 'Known as "Dahuo" (大火 - The Great Fire star) of Heart Mansion (心宿). The classic Book of Songs phrase "七月流火" (In the 7th month, Fire sinks) marks the sinking of Antares toward the southwest at dusk, signaling the onset of autumn chill.',
          zh: '东方青龙“心宿”主星，古称“大火星”。《诗经·豳风》“七月流火，九月授衣”，指夏历七月黄昏时大火星逐渐偏西下沉，预示盛夏已过、凉秋渐起。“荧惑守心”（火星逆行停驻心宿二）在古代被视为帝王驾崩的大凶天象。'
        }
      }
    },
    {
      id: 'pollux',
      name: 'Pollux',
      nameCn: '北河三',
      pinyin: 'Běihé Sān',
      bayer: 'β Gem',
      constellation: 'Gemini',
      constellationCn: '双子座',
      ra: 7.7553,
      dec: 28.0262,
      mag: 1.14,
      distanceLy: 33.8,
      spectralType: 'K0IIIb',
      color: '#ffd699',
      summaryEn: 'Immortal orange giant twin of Gemini; confirmed host of an extrasolar giant gas planet.',
      summaryCn: '双子座的不朽金橙色双生子，已确认拥有一颗巨大系外行星环绕。',
      astrophysics: {
        en: [
          'Closest giant star to the Sun, located at 33.8 light-years.',
          'Slightly brighter than its twin Castor, despite bearing the designation Beta Geminorum.',
          'Orbited by exoplanet Pollux b (Thestias), a gas giant with at least twice Jupiter’s mass.',
          'Surface glows at 4,660 K with 43 times solar luminosity.'
        ],
        zh: [
          '距离太阳系最近的巨星（仅 33.8 光年）。',
          '虽然拜耳命名为β星，但视亮度实际超过了其双生兄弟北河二（α星）。',
          '2006年确认拥有一颗至少两倍木星质量的气态系外行星“忒斯提亚斯”（Pollux b）。',
          '光度约为太阳的 43 倍。'
        ]
      },
      mythology: {
        western: {
          en: 'The immortal twin son of Zeus and Leda. Inseparable from his mortal brother Castor, immortalized forever side by side in the heavens.',
          zh: '宙斯与勒达所生的不朽神子，与凡人兄弟卡斯托尔生死相依，宙斯感其兄弟情深将他们化为天际双子星。'
        },
        chinese: {
          en: 'Third star of "Beihe" (North River) in Well Mansion (井宿), serving as the northern frontier gate guard of the imperial realm.',
          zh: '井宿“北河”第三星，与南河遥相守望，共同守卫天汉关隘。'
        }
      }
    },
    {
      id: 'castor',
      name: 'Castor',
      nameCn: '北河二',
      pinyin: 'Běihé Èr',
      bayer: 'α Gem',
      constellation: 'Gemini',
      constellationCn: '双子座',
      ra: 7.5767,
      dec: 31.8883,
      mag: 1.58,
      distanceLy: 51.0,
      spectralType: 'A1V + A2Vm',
      color: '#e0ecff',
      summaryEn: 'Astonishing sextuple star system composed of three pairs of gravitationally bound binary stars.',
      summaryCn: '罕见的六合星系统，由三对互相环绕公转的双星共舞组成。',
      astrophysics: {
        en: [
          'What appears to the naked eye as a single star is actually six individual stars in three binary pairs (Castor A, B, and C).',
          'Castor A and B are bright blue-white stars; Castor C is a pair of red dwarfs.',
          'Radiant origin of the annual Geminid meteor shower in mid-December.',
          'Distance is roughly 51 light-years.'
        ],
        zh: [
          '肉眼看似一颗单星，实则是三对双星系统通过引力缠绕交织而成的“六合星”奇观。',
          'A系统与B系统均为明亮的蓝白星，C系统则是一对微弱的红矮星。',
          '每年12月中旬著名“双子座流星雨”的辐射点正是由此星附近散射而出。',
          '距离地球约 51 光年。'
        ]
      },
      mythology: {
        western: {
          en: 'The mortal twin brother of Pollux, famed for his equestrian prowess with horses.',
          zh: '双子中擅长驯马驾车的凡人兄长，与波吕克斯情深意笃。'
        },
        chinese: {
          en: 'Second star of "Beihe" (North River), representing northern celestial ramparts.',
          zh: '井宿“北河”第二星，天界北防要隘。'
        }
      }
    },
    {
      id: 'fomalhaut',
      name: 'Fomalhaut',
      nameCn: '北落师门',
      pinyin: 'Běiluò Shīmén',
      bayer: 'α PsA',
      constellation: 'Piscis Austrinus',
      constellationCn: '南鱼座',
      ra: 22.9608,
      dec: -29.6222,
      mag: 1.16,
      distanceLy: 25.1,
      spectralType: 'A3V',
      color: '#e4edff',
      summaryEn: 'Solitary guardian of autumn skies surrounded by a vast dust debris ring dubbed "Sauron’s Eye".',
      summaryCn: '秋季南方夜空的孤独巡天守卫，环绕着形似“索伦之眼”的浩大尘埃碎屑环。',
      astrophysics: {
        en: [
          'Solitary bright star in a dim patch of southern autumn sky.',
          'Possesses an iconic circumstellar debris belt extensively imaged by Hubble and the James Webb Space Telescope.',
          'The intricate ring structure shows evidence of multiple shepherd planets sculpting nested dust belts.',
          'Located only 25 light-years from Earth.'
        ],
        zh: [
          '秋夜南方低空几乎唯一孤傲闪烁的一等亮星。',
          '拥有著名的尘埃岩屑圆环，因形态酷似魔戒中的“索伦之眼”闻名，被韦伯与哈勃望远镜精细解析。',
          '多重嵌套环带结构揭示其内部存在多颗“牧羊行星”在引力雕刻尘埃盘。',
          '距离地球约 25 光年。'
        ]
      },
      mythology: {
        western: {
          en: 'From Arabic "Fam al-Hūt" meaning "Mouth of the Southern Fish". One of the four ancient Royal Stars of Persia.',
          zh: '源于阿拉伯语“南鱼之口”，古波斯天文学中镇守南方天域的四大王星之一。'
        },
        chinese: {
          en: 'Belongs to the Room Mansion (室宿). Represents the grand northern military camp gate of the imperial capital garrison ("北落" = northern camp; "师门" = army gate). Revered as an omen of military strength and peace.',
          zh: '属于室宿，古称“北落师门”。“北落”指北方军营，“师门”指军营大门。象征天廷守卫京畿的中央禁军北大营，此星明亮稳定象征国家兵强马壮、天下太平。'
        }
      }
    },
    {
      id: 'regulus',
      name: 'Regulus',
      nameCn: '轩辕十四',
      pinyin: 'Xuānyuán Shísì',
      bayer: 'α Leo',
      constellation: 'Leo',
      constellationCn: '狮子座',
      ra: 10.1395,
      dec: 11.9672,
      mag: 1.40,
      distanceLy: 79.0,
      spectralType: 'B8IVn',
      color: '#c2d8ff',
      summaryEn: 'Cor Leonis (Heart of the Lion); spins so fast in 15.9 hours that it bulges dramatically at its equator.',
      summaryCn: '狮子座的傲岸心脏；以15.9小时的极速自转狂奔，赤道半径比两极宽出32%。',
      astrophysics: {
        en: [
          'Quadruple star system dominated by a fast-rotating blue-white subgiant.',
          'Spins at 320 km/s (86% of centrifugal breakup speed), flattening into a pronounced oblate spheroid.',
          'Lies extremely close to the ecliptic plane and is regularly occulted by the Moon and planets.',
          'Luminosity is approximately 288 times that of the Sun.'
        ],
        zh: [
          '由快速自转的蓝白亚巨星主导的四合星系统。',
          '赤道自转线速度高达 320 km/s，已达离心瓦解极速的86%，星体呈显著压扁状。',
          '非常贴近黄道面，经常发生罕见的月掩星与行星掩星现象。',
          '总光度约为太阳的 288 倍。'
        ]
      },
      mythology: {
        western: {
          en: 'Latin name means "Prince" or "Little King", also celebrated as "Cor Leonis" (Heart of the Lion). Ancient Babylonian leader of the celestial stars.',
          zh: '拉丁语意为“小国王”或“王子”，亦称“狮子之心”。在巴比伦与波斯天文学中是四方王星之首席。'
        },
        chinese: {
          en: 'Belongs to the Star Mansion (星宿) as the 14th star of "Xuanyuan", representing the Yellow Emperor (黄帝) and Empress Dowager’s supreme ancestral chariot.',
          zh: '星宿“轩辕”第十四星。“轩辕”以人文初祖黄帝之名命名，宛如一条蜿蜒巨龙盘踞天际，轩辕十四作为轩辕主星，象征黄帝帝位与至尊皇族正统。'
        }
      }
    },
    {
      id: 'canopus',
      name: 'Canopus',
      nameCn: '老人星 (南极老人)',
      pinyin: 'Lǎorén Xīng',
      bayer: 'α Car',
      constellation: 'Carina',
      constellationCn: '船底座',
      ra: 6.3992,
      dec: -52.6957,
      mag: -0.74,
      distanceLy: 310,
      spectralType: 'A9II',
      color: '#f5f7ff',
      summaryEn: 'Second brightest star in the entire night sky; ancient Chinese god of longevity and modern spacecraft navigation beacon.',
      summaryCn: '全天第二亮星，中国传统代表吉祥福寿的南极仙翁老人星，现代航天器的空间姿态导航星。',
      astrophysics: {
        en: [
          'Second brightest star in Earth’s night sky, outshone only by Sirius.',
          'Rare white bright giant/supergiant with 10,000 times solar luminosity.',
          'Widely used in robotic interplanetary spacecraft attitude guidance via Canopus Star Trackers.',
          'Invisible north of latitude 37°N due to its southern declination.'
        ],
        zh: [
          '全天第二亮星，仅次于天狼星。',
          '稀有的亮巨星/超巨星，辐射光度达太阳的 1 万倍以上。',
          '在现代航天工程中，因其极高的光度与孤立的赤纬位置，常被星敏感器（Star Tracker）用作航天器姿态定向的核心基准。',
          '因赤纬达南纬52°，在北纬37°以北地区永不升出地平线。'
        ]
      },
      mythology: {
        western: {
          en: 'Named after Canopus, the legendary pilot and navigator of King Menelaus’ fleet in Homer’s Iliad during the Trojan War.',
          zh: '以荷马史诗特洛伊战争中斯巴达国王墨涅拉俄斯的大船领航员卡诺珀斯之名命名。'
        },
        chinese: {
          en: 'Revered as the God of Longevity (寿星 / 南极仙翁). Because it appears fleetingly low on the southern horizon only in calm, unpolluted skies, its sighting was hailed as a heavenly sign of peace and long life for the ruler.',
          zh: '中国神话中的“南极仙翁”或“寿星”。在北宋以前都城（西安、洛阳、开封等）仅在秋季短暂浮出南方地平线上数度，古人认为唯有国泰民安、海晏河清之时此星方现，见之主天下升平、人寿年丰。'
        }
      }
    },
    {
      id: 'alphacentauri',
      name: 'Alpha Centauri',
      nameCn: '南门二',
      pinyin: 'Nánmén Èr',
      bayer: 'α Cen',
      constellation: 'Centaurus',
      constellationCn: '半人马座',
      ra: 14.6608,
      dec: -60.8339,
      mag: -0.27,
      distanceLy: 4.37,
      spectralType: 'G2V + K1V',
      color: '#ffe5b4',
      summaryEn: 'The closest star system to our Solar System; includes Proxima Centauri and habitable zone exoplanets.',
      summaryCn: '距太阳系最近的恒星系统（4.37光年），包含比邻星及多颗系外行星。',
      astrophysics: {
        en: [
          'Triple star system consisting of Alpha Centauri A (Rigil Kentaurus), B (Toliman), and C (Proxima Centauri).',
          'Proxima Centauri is the closest known individual star to Earth at 4.246 light-years.',
          'Hosts terrestrial exoplanets including Proxima Centauri b within the habitable zone.',
          'Target of futuristic interstellar exploration projects like Breakthrough Starshot.'
        ],
        zh: [
          '由南门二 A（半人马座αA）、B星及比邻星（C星）组成的三合星系统。',
          '其中的比邻星是已知距离地球最近的单星（约 4.246 光年）。',
          '已探明拥有多颗类地行星，包括位于宜居带内的比邻星 b。',
          '科幻名作《三体》中三体文明的原型母星系，亦是“突破摄星”纳米光帆探测器计划的目的地。'
        ]
      },
      mythology: {
        western: {
          en: 'Marks the right front foot of the wise centaur Chiron, teacher of Achilles, Jason, and Hercules.',
          zh: '代表希腊神话中通晓天文与医药的贤者喀戎（半人马）的前蹄。'
        },
        chinese: {
          en: 'The second star of the "Nanmen" (South Gate) asterism in Horn Mansion (角宿), standing sentry at the southern gate of heaven.',
          zh: '属于角宿“南门”星官之第二星，象征天阙朝南之南天正门守卫。'
        }
      }
    },
    {
      id: 'hadar',
      name: 'Hadar',
      nameCn: '马腹一',
      pinyin: 'Mǎfù Yī',
      bayer: 'β Cen',
      constellation: 'Centaurus',
      constellationCn: '半人马座',
      ra: 14.0637,
      dec: -60.3730,
      mag: 0.61,
      distanceLy: 390,
      spectralType: 'B1III',
      color: '#a0c2ff',
      summaryEn: 'Luminous blue giant pointer star guiding southern stargazers to the Southern Cross.',
      summaryCn: '南半球著名的指南双星之一，与南门二连线直指南十字座。',
      astrophysics: {
        en: [
          'Triple star system dominated by a pair of massive Beta Cephei pulsating blue giant stars.',
          'Shines with a combined luminosity 40,000 times that of the Sun.',
          'Together with Alpha Centauri, forms the famous "Southern Pointers" directing navigators to the Southern Cross.'
        ],
        zh: [
          '由一对大质量仙王座β型脉动蓝巨星主导的三合星系统。',
          '总光度约为太阳的 4 万倍。',
          '与南门二并称为著名的“南十字座双指针”，二者连线垂直平分线直越南十字座。'
        ]
      },
      mythology: {
        western: {
          en: 'Arabic "Hadar" meaning "Ground" or "Settlement". Navigational companion to Alpha Centauri.',
          zh: '源于阿拉伯语“地面”，自古与半人马座α星同为南天航海不可或缺的指路明灯。'
        },
        chinese: {
          en: 'Belongs to the Southern Constellations added in Ming Dynasty as the first star of "Mafu" (Horse Belly).',
          zh: '明代徐光启依据西洋星表补编的南天星官“马腹”第一星，标志半人马身躯腹部。'
        }
      }
    },
    // Big Dipper (Ursa Major) Stars
    {
      id: 'dubhe',
      name: 'Dubhe',
      nameCn: '天枢 (北斗一)',
      pinyin: 'Tiānshū',
      bayer: 'α UMa',
      constellation: 'Ursa Major',
      constellationCn: '大熊座',
      ra: 11.0622,
      dec: 61.7508,
      mag: 1.79,
      distanceLy: 123,
      spectralType: 'K0III',
      color: '#ffd099',
      summaryEn: 'Primary pointer star of the Big Dipper; line through Merak points straight to Polaris.',
      summaryCn: '北斗七星的第一星（天枢），与天璇连线延长5倍直指北极星。',
      astrophysics: {
        en: [
          'Orange giant star with 300 times solar luminosity, accompanied by a main-sequence F-type star.',
          'Forms the outer bowl edge of the Big Dipper asterism.',
          'Crucial celestial pointer: extending the line from Merak through Dubhe by 5 times leads directly to Polaris.'
        ],
        zh: [
          '光度为太阳300倍的橙巨星，伴有一颗F型主序星。',
          '北斗七星勺口外缘第一星。',
          '夜空最著名的寻北标杆：由天璇向天枢引出直线并延长约5倍距离，正中北极星。'
        ]
      },
      mythology: {
        western: {
          en: 'Arabic "Al-Dubb" meaning "The Bear". Marks the back of Callisto, the maiden transformed into a great bear by Hera.',
          zh: '阿拉伯语意为“大熊之躯”，在神话中标志被赫拉化为大熊的仙女卡利斯托之脊背。'
        },
        chinese: {
          en: 'Known as "Tianshu" (天枢) or "Greedy Wolf" (贪狼星) in Daoist astrology, symbolizing the heavenly pivot of administrative power.',
          zh: '道教北斗本命星中的“贪狼星”或“天枢”。天枢意为天界旋转之枢纽，象征朝廷正纲与万物造化之先。'
        }
      }
    },
    {
      id: 'merak',
      name: 'Merak',
      nameCn: '天璇 (北斗二)',
      pinyin: 'Tiānxuán',
      bayer: 'β UMa',
      constellation: 'Ursa Major',
      constellationCn: '大熊座',
      ra: 11.0307,
      dec: 56.3824,
      mag: 2.37,
      distanceLy: 79.7,
      spectralType: 'A1V',
      color: '#e4edff',
      summaryEn: 'Southern pointer star of the Big Dipper bowl; white main-sequence star surrounded by a debris disc.',
      summaryCn: '北斗七星勺底第二星（天璇），指引方向的白色主序星。',
      astrophysics: {
        en: [
          'White main-sequence star roughly 2.7 times the mass of the Sun and 63 times more luminous.',
          'Shows infrared excess indicating a cool circumstellar debris ring similar to the Kuiper Belt.',
          'Member of the Ursa Major Moving Group.'
        ],
        zh: [
          '质量为太阳2.7倍、光度达63倍的白色主序星。',
          '红外观测表明其周围拥有一圈类似太阳系柯伊伯带的低温星周碎屑盘。',
          '属于著名的大熊座移动星群成员。'
        ]
      },
      mythology: {
        western: {
          en: 'From Arabic "Al-Maraqq" meaning "The Loin" of the Great Bear.',
          zh: '阿拉伯语意为“大熊之腰腹”。'
        },
        chinese: {
          en: 'Known as "Tianxuan" (天璇) or "Giant Gate" (巨门星) in Daoist astrology; represents rotational celestial jade.',
          zh: '北斗第二星天璇，道教中尊称“巨门星”，象征天运回旋、法度无私。'
        }
      }
    },
    {
      id: 'phecda',
      name: 'Phecda',
      nameCn: '天玑 (北斗三)',
      pinyin: 'Tiānjī',
      bayer: 'γ UMa',
      constellation: 'Ursa Major',
      constellationCn: '大熊座',
      ra: 11.8971,
      dec: 53.6948,
      mag: 2.44,
      distanceLy: 83.2,
      spectralType: 'A0V',
      color: '#e2ebff',
      summaryEn: 'Inner bowl corner of the Big Dipper; fast rotating A-type star with a faint companion.',
      summaryCn: '北斗七星勺底靠近勺柄处的第三星（天玑）。',
      astrophysics: {
        en: [
          'Fast-spinning main sequence star with a rotation period of under 18 hours.',
          'Shines with 71 times solar luminosity at 83 light-years away.',
          'Gravitationally bound binary star system.'
        ],
        zh: [
          '自转周期不足18小时的高速自转A型主序星。',
          '距离地球83光年，辐射光度约为太阳的71倍。',
          '是一颗具有微弱伴星的引力束缚双星。'
        ]
      },
      mythology: {
        western: {
          en: 'From Arabic "Al-Fakhidh" meaning "The Thigh" of the bear.',
          zh: '阿拉伯语意为“熊之大腿”。'
        },
        chinese: {
          en: 'Called "Tianji" (天玑) or "Lu Cun" (禄存星) in Chinese astrology, symbolizing prosperity and judicial balance.',
          zh: '北斗第三星天玑，道家尊为“禄存星”，主禄禄长存、明刑弼教。'
        }
      }
    },
    {
      id: 'megrez',
      name: 'Megrez',
      nameCn: '天权 (北斗四)',
      pinyin: 'Tiānquán',
      bayer: 'δ UMa',
      constellation: 'Ursa Major',
      constellationCn: '大熊座',
      ra: 12.2571,
      dec: 57.0326,
      mag: 3.31,
      distanceLy: 80.5,
      spectralType: 'A3V',
      color: '#e8efff',
      summaryEn: 'Joint star connecting the Big Dipper’s bowl to its handle; the faintest of the seven stars.',
      summaryCn: '连接北斗勺身与勺柄的连接星（天权），七星中视星等最弱却最灵动。',
      astrophysics: {
        en: [
          'Faintest of the seven Big Dipper stars (magnitude 3.31).',
          'Emits 14 times the luminosity of the Sun and has a mass 1.6 times solar mass.',
          'Possesses a dusty circumstellar debris disk.'
        ],
        zh: [
          '北斗七星中视亮度最暗的恒星（3.31等）。',
          '光度约为太阳的14倍，质量约为太阳的1.6倍。',
          '星体周围环绕着薄薄的碎屑尘埃盘。'
        ]
      },
      mythology: {
        western: {
          en: 'From Arabic "Al-Maghriz" meaning "The Base" where the tail joins the body.',
          zh: '阿拉伯语意为熊尾与身躯的“连接根部”。'
        },
        chinese: {
          en: 'Called "Tianquan" (天权) or "Wenqu" (文曲星) in Chinese culture. The patron star of scholars, literature, imperial examinations, and poetic brilliance.',
          zh: '北斗第四星天权，即名扬天下的“文曲星”！主天下文章锦绣与科举及第。民间传说包拯、苏东坡等先贤皆为文曲星下凡转世。'
        }
      }
    },
    {
      id: 'alioth',
      name: 'Alioth',
      nameCn: '玉衡 (北斗五)',
      pinyin: 'Yùhéng',
      bayer: 'ε UMa',
      constellation: 'Ursa Major',
      constellationCn: '大熊座',
      ra: 12.9004,
      dec: 55.9598,
      mag: 1.77,
      distanceLy: 82.6,
      spectralType: 'A1III-IVp',
      color: '#dce8ff',
      summaryEn: 'Brightest star in Ursa Major; displays unusual magnetic field oscillations and spectral variations.',
      summaryCn: '北斗七星与整个大熊座中最明亮的恒星，拥有奇异强磁场与元素光谱分层。',
      astrophysics: {
        en: [
          'Brightest star in Ursa Major and 31st brightest in the entire night sky.',
          'An Alpha2 Canum Venaticorum variable whose intense magnetic field segregates chemical elements in its atmosphere.',
          'Historical navigational star widely used in maritime and aerial navigation.'
        ],
        zh: [
          '大熊座全星座最亮星，位列全天第31亮星。',
          '著名的猎犬座α2型变星，拥有极其强大的局部偶极磁场，导致表面不同区域铬、锰等重元素产生奇特丰度偏析。',
          '自古是航海与航空授时导航的关键指引星。'
        ]
      },
      mythology: {
        western: {
          en: 'From Arabic "Al-Yat" meaning "The Fat Tail" of the sheep, as ancient Middle Eastern sky watchers saw a celestial flock.',
          zh: '源于阿拉伯语“肥硕尾巴”，古代近东游牧民族曾将其视作天羊之尾。'
        },
        chinese: {
          en: 'Known as "Yuheng" (玉衡) or "Lianzhen" (廉贞星) in Daoist lore; represents the celestial measuring balance of heaven and earth.',
          zh: '北斗第五星玉衡，道教尊为“廉贞星”。玉衡象征量度天地运行的衡器天平，明察秋毫。'
        }
      }
    },
    {
      id: 'mizar',
      name: 'Mizar',
      nameCn: '开阳 (北斗六)',
      pinyin: 'Kāiyáng',
      bayer: 'ζ UMa',
      constellation: 'Ursa Major',
      constellationCn: '大熊座',
      ra: 13.3987,
      dec: 54.9254,
      mag: 2.23,
      distanceLy: 82.9,
      spectralType: 'A2V + A7m',
      color: '#e0ecff',
      summaryEn: 'Famous celestial eye-test binary with Alcor; the first double star ever resolved by telescope.',
      summaryCn: '与伴星“辅星（Alcor）”构成古代著名的视力测试双星，人类望远镜史上确认的第一对双星。',
      astrophysics: {
        en: [
          'Forms a famous naked-eye double star with 4th-magnitude Alcor, separated by 12 arcminutes.',
          'First telescopic binary ever discovered (by Benedetto Castelli and Galileo in 1617).',
          'First spectroscopic binary ever discovered (by Edward C. Pickering in 1889).',
          'Combined with Alcor, the whole gravitational system comprises six stars.'
        ],
        zh: [
          '与旁侧微弱的4等星“辅星（Alcor）”角距离仅12角分，在古代常作为弓箭手与骑兵的裸眼视力测试标准。',
          '1617年伽利略与其助手用望远镜首次将其分解为双星，是人类望远镜确认的首颗双星。',
          '1889年天文学家皮克林确认其为主序分光双星。',
          '连同辅星系统在内，整个开阳-辅星引力体系实为六合星系统。'
        ]
      },
      mythology: {
        western: {
          en: 'Known across Arab cultures as the "Horse and Rider" (Mizar being the horse, Alcor the rider). Ancient warriors tested sharp eyesight by resolving the pair.',
          zh: '在阿拉伯文化中被称为“战马与骑士”（开阳为马，辅星为骑士）。能用裸眼分清二者被视作拥有超常视觉的精锐弓箭手。'
        },
        chinese: {
          en: 'Known as "Kaiyang" (开阳) or "Wuqu" (武曲星) in Chinese lore. The patron celestial star of martial prowess, righteous generals, and strategic courage.',
          zh: '北斗第六星开阳，道教尊为威名赫赫的“武曲星”！主将帅兵权与勇武开疆。姜子牙、关羽、狄青等名将常被后世尊为武曲星转世。'
        }
      }
    },
    {
      id: 'alkaid',
      name: 'Alkaid',
      nameCn: '摇光 (北斗七)',
      pinyin: 'Yáoguāng',
      bayer: 'η UMa',
      constellation: 'Ursa Major',
      constellationCn: '大熊座',
      ra: 13.7923,
      dec: 49.3133,
      mag: 1.86,
      distanceLy: 103,
      spectralType: 'B3V',
      color: '#a8c6ff',
      summaryEn: 'The tip of the Big Dipper’s handle; young blue-white dwarf star pointing out seasonal change.',
      summaryCn: '北斗七星勺柄末梢第七星（摇光），古代观察斗柄所指以定四季流转。',
      astrophysics: {
        en: [
          'High temperature blue-white dwarf with a blistering surface of 15,540 K.',
          'Emits nearly 600 times the visual luminosity of the Sun.',
          'Unlike most other Big Dipper stars, it is NOT a member of the Ursa Major moving group, moving independently through space.'
        ],
        zh: [
          '表面温度高达 15,540 K 的青年高温蓝白主序星。',
          '光度约为太阳的 600 倍。',
          '与其他北斗主要恒星不同，摇光并不属于大熊座移动星群，而是独自在银河中向不同方向疾驰。'
        ]
      },
      mythology: {
        western: {
          en: 'From Arabic "Qā’id Banāt Na’sh" meaning "The Leader of the Daughters of the Bier" (mourners pacing around a funeral litter).',
          zh: '阿拉伯语意为“抬棺之女的领路人”，古代阿拉伯人将大熊四星视作灵柩，勺柄三星视作跟从的哀悼者。'
        },
        chinese: {
          en: 'Known as "Yaoguang" (摇光) or "Pojun" (破军星) in Chinese lore. Points out the four seasons: "When the handle points East, Spring arrives; South, Summer; West, Autumn; North, Winter".',
          zh: '北斗第七星摇光，道家尊为“破军星”，主先锋突围、破除万难。《冠子·环流》名言“斗柄东指，天下皆春；斗柄南指，天下皆夏；斗柄西指，天下皆秋；斗柄北指，天下皆冬”，所指正是摇光勺柄所指方向！'
        }
      }
    },
    // Orion additional stars
    {
      id: 'bellatrix',
      name: 'Bellatrix',
      nameCn: '参宿五',
      pinyin: 'Shēnxiù Wǔ',
      bayer: 'γ Ori',
      constellation: 'Orion',
      constellationCn: '猎户座',
      ra: 5.4189,
      dec: 6.3497,
      mag: 1.64,
      distanceLy: 250,
      spectralType: 'B2III',
      color: '#a9c7ff',
      summaryEn: 'Amazon Star marking Orion’s left shoulder; hot blue giant over 9,000 times brighter than the Sun.',
      summaryCn: '猎户座左肩的蓝巨星，光度达太阳9000倍以上的女战士之星。',
      astrophysics: {
        en: [
          'Massive blue giant with a surface temperature around 22,000 K.',
          'Mass is 8.6 times solar mass and luminosity exceeds 9,000 L☉.',
          'Will eventually evolve into an orange supergiant before shedding its outer layers.'
        ],
        zh: [
          '表面温度高达 22,000 K 的大质量蓝巨星。',
          '质量为太阳的 8.6 倍，总辐射光度超太阳 9,000 倍。',
          '参宿五与参宿四共同构成猎户挺拔威严的双肩。'
        ]
      },
      mythology: {
        western: {
          en: 'Latin name means "Female Warrior" or "Amazon Star", commanding the northern flank of Orion.',
          zh: '拉丁语意为“女战士”，在文艺复兴时期被称为亚马逊女战士星。'
        },
        chinese: {
          en: 'Fifth star of Shen Mansion (参宿), marking the northwestern vanguard shoulder of Orion.',
          zh: '参宿第五星，与参宿四共擎白虎之躯。'
        }
      }
    },
    {
      id: 'alnilam',
      name: 'Alnilam',
      nameCn: '参宿二',
      pinyin: 'Shēnxiù Èr',
      bayer: 'ε Ori',
      constellation: 'Orion',
      constellationCn: '猎户座',
      ra: 5.6036,
      dec: -1.2019,
      mag: 1.69,
      distanceLy: 2000,
      spectralType: 'B0Ia',
      color: '#9dbfff',
      summaryEn: 'Central star of Orion’s Belt; blue supergiant over 500,000 times more luminous than our Sun.',
      summaryCn: '猎户座腰带三星的正中核心星，光度达太阳50万倍的蓝超巨星。',
      astrophysics: {
        en: [
          'The middle of the three stars of Orion’s Belt.',
          'Immense blue supergiant roughly 64 times the Sun’s radius and 40 times solar mass.',
          'Its stellar wind blows out mass at 2,000 km/s, driving dense nebula glow nearby.'
        ],
        zh: [
          '猎户座腰带三星之中央主星。',
          '半径达太阳64倍、质量超太阳40倍的特大蓝超巨星。',
          '以每秒2000公里的狂暴恒星风抛射物质，激发周围分子云发出壮丽辉光。'
        ]
      },
      mythology: {
        western: {
          en: 'From Arabic "An-Nizhām" meaning "String of Pearls", referring to the central pearl on the Belt.',
          zh: '源于阿拉伯语“珍珠串”，被视作镶嵌在腰带正中最璀璨的一颗夜明珠。'
        },
        chinese: {
          en: 'Central star of Orion’s Belt in Shen Mansion (参宿). Folklore associates the three belt stars with the three gods of Fortune, Prosperity, and Longevity (福禄寿三星).',
          zh: '参宿二位居猎户腰带正中。民间俗称“三星高照，新春来到”，腰带参宿一、二、三被尊奉为民间祈福迎祥的“福星、禄星、寿星”！'
        }
      }
    },
    {
      id: 'alnitak',
      name: 'Alnitak',
      nameCn: '参宿一',
      pinyin: 'Shēnxiù Yī',
      bayer: 'ζ Ori',
      constellation: 'Orion',
      constellationCn: '猎户座',
      ra: 5.6793,
      dec: -1.9426,
      mag: 1.77,
      distanceLy: 1260,
      spectralType: 'O9.5Ib',
      color: '#95baff',
      summaryEn: 'Eastern star of Orion’s Belt; illuminates the famous Horsehead Nebula and Flame Nebula.',
      summaryCn: '猎户座腰带最东侧星，其强烈辐射点亮了举世闻名的马头星云与火焰星云。',
      astrophysics: {
        en: [
          'Triple star system anchored by a hot class-O supergiant, the brightest O-type star in the night sky.',
          'Surface temperature exceeds 29,500 K with luminosity 250,000 times solar.',
          'Its intense ultraviolet light ionizes the hydrogen gas of the Flame Nebula (NGC 2024).'
        ],
        zh: [
          '由罕见的高温O型超巨星主导的三合星系统，全天最明亮的O型星。',
          '表面温度高达 29,500 K，辐射功率为太阳的 25 万倍。',
          '其强劲的紫外光子激发了著名的马头星云（IC 434）背景与火焰星云的电离辉光。'
        ]
      },
      mythology: {
        western: {
          en: 'Arabic "An-Nitaq" means "The Girdle" or "Belt" of the Hunter.',
          zh: '阿拉伯语意为“腰带”，系猎户佩剑悬挂之处。'
        },
        chinese: {
          en: 'Easternmost star of the Belt in Shen Mansion (参宿), representing Fortune (福星) in classic spring festival folklore.',
          zh: '参宿第一星，民间岁末迎春“福禄寿”三星之一的福星。'
        }
      }
    },
    {
      id: 'mintaka',
      name: 'Mintaka',
      nameCn: '参宿三',
      pinyin: 'Shēnxiù Sān',
      bayer: 'δ Ori',
      constellation: 'Orion',
      constellationCn: '猎户座',
      ra: 5.5334,
      dec: -0.2991,
      mag: 2.23,
      distanceLy: 1200,
      spectralType: 'O9.5II',
      color: '#98bdff',
      summaryEn: 'Western anchor of Orion’s Belt, situated almost precisely on the celestial equator.',
      summaryCn: '猎户座腰带最西端之星，位置几乎丝毫不差地坐落在天赤道线上。',
      astrophysics: {
        en: [
          'Complex multiple star system featuring eclipsing binaries.',
          'Located within 0.3° of the celestial equator, meaning it rises almost exactly due East and sets due West worldwide.',
          'Johannes Hartmann used Mintaka in 1904 to discover the interstellar medium by detecting stationary calcium lines.'
        ],
        zh: [
          '包含食双星的复杂多星系统。',
          '距离天球赤道仅 0.3°，因而在全球几乎所有海岸它都几乎严格从正东方升起、正西方落下。',
          '1904年哈特曼通过对参宿三光谱中固定的吸收线分析，首次证实了星际空间充满稀薄气体介质（星际介质）。'
        ]
      },
      mythology: {
        western: {
          en: 'From Arabic "Al-Mintaqah" meaning "The Belt". Universal navigation beacon because of its equatorial position.',
          zh: '阿拉伯语意为“腰带”，因横跨天赤道成为全球水手最通用的东西方位标杆。'
        },
        chinese: {
          en: 'Westernmost star of Orion’s Belt in Shen Mansion (参宿), representing Longevity (寿星) in folklore.',
          zh: '参宿第三星，民间三星高照之“寿星”。'
        }
      }
    },
    // Cassiopeia
    {
      id: 'schedar',
      name: 'Schedar',
      nameCn: '王良四',
      pinyin: 'Wángliáng Sì',
      bayer: 'α Cas',
      constellation: 'Cassiopeia',
      constellationCn: '仙后座',
      ra: 0.6751,
      dec: 56.5373,
      mag: 2.24,
      distanceLy: 228,
      spectralType: 'K0IIIa',
      color: '#ffc982',
      summaryEn: 'Bottom-right point of the distinctive celestial "W" of Cassiopeia; luminous orange giant.',
      summaryCn: '仙后座标志性“W”字形右下角主星，金橙色巨星。',
      astrophysics: {
        en: [
          'Evolved orange giant ~42 times solar diameter and 770 times solar luminosity.',
          'Variable star whose brightness subtle shifts were studied by NASA’s Kepler mission.',
          'Key navigational landmark in the circumpolar north.'
        ],
        zh: [
          '直径约为太阳42倍、光度达770倍的高光度橙巨星。',
          '北天拱极区标志星，与北斗七星隔着北极星遥遥相对。'
        ]
      },
      mythology: {
        western: {
          en: 'From Arabic "Sadr" meaning "Breast", representing the seated Queen Cassiopeia of Ethiopia.',
          zh: '阿拉伯语意为“胸膛”，代表坐在王座上自矜美貌的埃塞俄比亚王后卡西俄佩亚。'
        },
        chinese: {
          en: 'Named after "Wang Liang" (王良), the legendary ancient charioteer of the Spring and Autumn period famed for his master control of four divine horses.',
          zh: '奎宿“王良”第四星。王良是春秋晋国著名的御马驭车宗师，天文学上以其名命此五星星官，象征御天马巡察四方。'
        }
      }
    },
    // Southern Cross
    {
      id: 'acrux',
      name: 'Acrux',
      nameCn: '十字架二',
      pinyin: 'Shízìjià Èr',
      bayer: 'α Cru',
      constellation: 'Crux',
      constellationCn: '南十字座',
      ra: 12.4433,
      dec: -63.0991,
      mag: 0.76,
      distanceLy: 320,
      spectralType: 'B0.5IV + B1V',
      color: '#95b7ff',
      summaryEn: 'Brightest star of the Southern Cross; featured on national flags of Australia, Brazil, and New Zealand.',
      summaryCn: '南十字座最璀璨的主星，被载入澳大利亚、巴西、新西兰等国国旗。',
      astrophysics: {
        en: [
          'Multiple star system located 320 light-years away.',
          'Southernmost star of the Southern Cross asterism.',
          'Forms the primary southern celestial compass: the long axis of the cross extended 4.5 times downwards locates the South Celestial Pole.'
        ],
        zh: [
          '由两颗高温蓝白星紧密组成的双星系统，位于南十字座长轴南端。',
          '南半球最著名的天然罗盘：沿十字架长轴（十字架一至十字架二）向下延伸4.5倍距离，便可精准定位南天极。',
          '广泛绘制于大洋洲与南美洲多国国旗与国徽之上。'
        ]
      },
      mythology: {
        western: {
          en: 'Key star of Crux, guiding explorers and navigators across the uncharted southern oceans since the Age of Discovery.',
          zh: '大航海时代麦哲伦与达伽马探索南半球未知名海域最重要的航向灯塔。'
        },
        chinese: {
          en: 'Added to Chinese charts in the late Ming Dynasty under the Southern Constellations as the second star of "Shizijia" (Cross).',
          zh: '明代崇祯年间徐光启主持编译《崇祯历书》时引入的南天星官“十字架”第二星。'
        }
      }
    }
  ];

  // Constellation connecting lines
  const CONSTELLATIONS = [
    {
      id: 'big-dipper',
      name: 'Big Dipper',
      nameCn: '北斗七星',
      lines: [
        ['dubhe', 'merak'],
        ['merak', 'phecda'],
        ['phecda', 'megrez'],
        ['megrez', 'dubhe'], // close bowl
        ['megrez', 'alioth'],
        ['alioth', 'mizar'],
        ['mizar', 'alkaid']
      ],
      pointer: {
        from: 'merak',
        to: 'dubhe',
        target: 'polaris',
        nameEn: 'Pointer to Polaris (5x)',
        nameCn: '指极线 (5倍延长至北极星)'
      }
    },
    {
      id: 'orion',
      name: 'Orion',
      nameCn: '猎户座',
      lines: [
        ['betelgeuse', 'bellatrix'],
        ['bellatrix', 'mintaka'],
        ['mintaka', 'alnilam'],
        ['alnilam', 'alnitak'],
        ['alnitak', 'betelgeuse'],
        ['bellatrix', 'rigel'],
        ['alnitak', 'rigel'],
        ['rigel', 'mintaka']
      ]
    },
    {
      id: 'summer-triangle',
      name: 'Summer Triangle',
      nameCn: '夏季大三角',
      isAsterism: true,
      lines: [
        ['vega', 'deneb'],
        ['deneb', 'altair'],
        ['altair', 'vega']
      ]
    },
    {
      id: 'winter-triangle',
      name: 'Winter Triangle',
      nameCn: '冬季大三角',
      isAsterism: true,
      lines: [
        ['betelgeuse', 'sirius'],
        ['sirius', 'procyon'],
        ['procyon', 'betelgeuse']
      ]
    },
    {
      id: 'gemini',
      name: 'Gemini',
      nameCn: '双子座',
      lines: [
        ['castor', 'pollux']
      ]
    },
    {
      id: 'centaurus-crux',
      name: 'Centaurus & Crux',
      nameCn: '半人马与南十字',
      lines: [
        ['alphacentauri', 'hadar']
      ]
    }
  ];

  // Procedural deterministic background stars (1000 stars)
  function generateBackgroundStars(count = 900) {
    const stars = [];
    // Pseudo-random linear congruential generator for reproducibility
    let seed = 421337;
    function rand() {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296.0;
    }

    const colors = ['#9bb0ff', '#cad8ff', '#f8f9ff', '#fff4e8', '#ffd2a1', '#ffb56c'];

    for (let i = 0; i < count; i++) {
      // Uniform distribution on sphere
      const u = rand();
      const v = rand();
      const ra = u * 24.0; // 0 to 24 hours
      const decRad = Math.asin(2.0 * v - 1.0); // uniform spherical dec
      const dec = decRad * (180.0 / Math.PI);

      // Magnitude distribution: more faint stars (mag 3.2 to 6.2)
      const mag = 3.2 + Math.pow(rand(), 0.6) * 3.0;
      const color = colors[Math.floor(rand() * colors.length)];

      stars.push({
        ra,
        dec,
        mag,
        color,
        twinklePhase: rand() * Math.PI * 2.0,
        twinkleSpeed: 1.0 + rand() * 2.5
      });
    }
    return stars;
  }

  const BACKGROUND_STARS = generateBackgroundStars(900);

  // Milky Way Galactic Equator Waypoints across Northern and Southern skies
  const MILKY_WAY_WAYPOINTS = [
    { ra: 17.76, dec: -29.0, width: 26, intensity: 1.0, isCore: true, labelEn: 'Galactic Center', labelZh: '银河核心 (人马座)' },
    { ra: 18.33, dec: -20.0, width: 22, intensity: 0.92 },
    { ra: 18.87, dec: -10.0, width: 20, intensity: 0.88 }, // Scutum Cloud
    { ra: 19.67, dec: 5.0,   width: 18, intensity: 0.82 }, // Aquila
    { ra: 20.33, dec: 25.0,  width: 19, intensity: 0.86 }, // Vulpecula
    { ra: 20.80, dec: 42.0,  width: 22, intensity: 0.95, isCloud: true, labelEn: 'Cygnus Cloud', labelZh: '天鹅座银河 (大裂缝)' },
    { ra: 21.67, dec: 52.0,  width: 18, intensity: 0.82 }, // Deneb to Cepheus
    { ra: 22.33, dec: 58.0,  width: 16, intensity: 0.78 }, // Cepheus
    { ra: 23.60, dec: 61.0,  width: 15, intensity: 0.74 },
    { ra: 1.00,  dec: 62.0,  width: 16, intensity: 0.76 }, // Cassiopeia
    { ra: 2.10,  dec: 59.0,  width: 15, intensity: 0.74 },
    { ra: 3.00,  dec: 55.0,  width: 15, intensity: 0.72 }, // Perseus
    { ra: 4.67,  dec: 42.0,  width: 14, intensity: 0.68 }, // Auriga
    { ra: 5.87,  dec: 26.0,  width: 13, intensity: 0.62, labelEn: 'Galactic Anticenter', labelZh: '银极反向点' }, // Taurus / Gemini
    { ra: 6.80,  dec: 10.0,  width: 14, intensity: 0.68 }, // Monoceros
    { ra: 7.67,  dec: -12.0, width: 15, intensity: 0.72 }, // Canis Major
    { ra: 8.53,  dec: -28.0, width: 17, intensity: 0.78 }, // Puppis
    { ra: 9.67,  dec: -45.0, width: 18, intensity: 0.82 }, // Vela
    { ra: 10.80, dec: -59.0, width: 23, intensity: 0.95, isCloud: true, labelEn: 'Carina Nebula', labelZh: '船底座大星云' },
    { ra: 12.53, dec: -63.0, width: 19, intensity: 0.88 }, // Crux
    { ra: 14.33, dec: -62.0, width: 19, intensity: 0.88 }, // Centaurus
    { ra: 15.67, dec: -54.0, width: 19, intensity: 0.90 }, // Circinus / Norma
    { ra: 16.53, dec: -42.0, width: 22, intensity: 0.94 }, // Scorpius (Tail)
    { ra: 17.20, dec: -34.0, width: 24, intensity: 0.98 }  // Scorpius (Shaula)
  ];

  // Solar System Bodies Metadata (Astrophysics, summaries, lore)
  const SOLAR_SYSTEM_METADATA = {
    sun: {
      id: 'sun',
      name: 'Sun',
      nameCn: '太阳',
      pinyin: 'Tàiyáng',
      bayer: '☉ Sol',
      constellation: 'Ecliptic',
      constellationCn: '黄道',
      spectralType: 'G2V Star',
      distanceLy: 0.0000158,
      summaryEn: 'Central star of the Solar System; powering life on Earth with 4 million tons of matter converted to energy per second.',
      summaryCn: '太阳系的中心恒星，每秒将 400 万吨物质转化为能量滋养地球万物。',
      astrophysics: {
        en: [
          'Distance from Earth: 1.0 AU (149.6 million km / 8.3 light-minutes).',
          'Surface effective temperature: ~5,778 K.',
          'Apparent Magnitude: -26.74 (the brightest object in our sky).',
          'Contains 99.86% of the entire mass of the Solar System.'
        ],
        zh: [
          '距离地球约 1.496 亿公里（1 天文单位 / 8.3 光分）。',
          '表面有效温度约 5,778 K。',
          '视星等 -26.74，是全天最璀璨辉煌的天体。',
          '占据整个太阳系总质量的 99.86%。'
        ]
      },
      mythology: {
        western: {
          en: 'In Greek and Roman mythology, personified as the Titan Helios and Apollo, driving the radiant golden chariot across the celestial dome each day.',
          zh: '古希腊与罗马神话中代表太阳神赫利俄斯（Helios）与阿波罗，每日驾驭四马金轮烈焰日车巡行天宇。'
        },
        chinese: {
          en: 'In Chinese antiquity, the Sun is "Taiyang" (The Supreme Yang) and home of the mythical Three-Legged Golden Crow (三足金乌). Xihe (羲和) drives the six-dragon chariot across the sky.',
          zh: '华夏上古尊为“太阳神”与“金乌”。《山海经》载羲和浴日、驾六龙日车巡天；后有后羿引弓射下九日以除万民焦渴之壮丽神话。'
        }
      }
    },
    moon: {
      id: 'moon',
      name: 'Moon',
      nameCn: '月亮 (月球)',
      pinyin: 'Yuèliang',
      bayer: '☾ Luna',
      constellation: 'Ecliptic',
      constellationCn: '白道',
      spectralType: 'Satellite',
      distanceLy: 0.00000004,
      summaryEn: 'Earth’s only natural satellite; tidally locked with mesmerizing phases from crescent to full moon.',
      summaryCn: '地球唯一的天然卫星，潮汐锁定，月相随日地几何位置周而复始。',
      astrophysics: {
        en: [
          'Average distance: 384,400 km (1.28 light-seconds).',
          'Orbital synodic period: 29.53 days (one lunar month).',
          'Apparent Magnitude: -12.74 at Full Moon.',
          'Causes ocean tides on Earth via gravitational tidal forces.'
        ],
        zh: [
          '距地球平均 384,400 公里（约 1.28 光秒）。',
          '朔望月公转周期约 29.53 天。',
          '满月时视星等达 -12.74，是夜空中最亮的天体。',
          '通过引力潮汐力主导地球海洋潮起潮落。'
        ]
      },
      mythology: {
        western: {
          en: 'Personified as the Roman goddess Luna and Greek Selene, goddess of the moon who drove a silver chariot through the night.',
          zh: '古罗马神话中的月亮女神露娜（Luna）与希腊塞勒涅，乘白银车巡夜。'
        },
        chinese: {
          en: 'Known as "Taiyin" (太阴), Chang’e (嫦娥), and Chanjuan (婵娟). Home to the Jade Rabbit and Wu Gang beside the sweet osmanthus tree, immortalized by Su Shi: "May we all be blessed with longevity, though thousands of miles apart, gazing at the same fair moon."',
          zh: '华夏古称“太阴”、“婵娟”、“望舒”。嫦娥奔月、玉兔捣药、吴刚伐桂的神话千年传唱；苏轼“但愿人长久，千里共婵娟”寄托天下游子万缕相思。'
        }
      }
    },
    venus: {
      id: 'venus',
      name: 'Venus',
      nameCn: '金星 (太白)',
      pinyin: 'Jīnxīng',
      bayer: '♀ Venus',
      constellation: 'Planetary',
      constellationCn: '行星',
      spectralType: 'Terrestrial Planet',
      distanceLy: 0.00001,
      summaryEn: 'The dazzling Morning Star (Phosphorus) and Evening Star (Hesperus); brightest planet in the night sky.',
      summaryCn: '全天最明亮的行星，晨称“启明”，暮称“长庚”，夜空中璀璨如钻石。',
      astrophysics: {
        en: [
          'Apparent Magnitude: up to -4.4 (brightest planet in the sky).',
          'Shrouded in dense reflective sulfuric acid clouds with a runaway greenhouse effect (465°C surface).',
          'Retrograde rotation: spins clockwise once every 243 Earth days.'
        ],
        zh: [
          '视星等最高达 -4.4，全天最明亮的行星，仅次于太阳和满月。',
          '稠密的二氧化碳大气与硫酸云产生强烈失控温室效应，表面温度达 465°C。',
          '罕见的自东向西逆向自转，自转周期长达 243 天。'
        ]
      },
      mythology: {
        western: {
          en: 'Named after Venus, Roman goddess of love and beauty (Greek Aphrodite), inspired by its brilliant golden-white glow.',
          zh: '古罗马爱与美之女神维纳斯（希腊阿佛洛狄忒），因其动人心魄的光芒得名。'
        },
        chinese: {
          en: 'Known in Chinese astronomy as "Taibai" (太白). Morning appearance is Qiming (启明); evening appearance is Changgeng (长庚). Revered as Taibai Jinxing, an immortal Taoist deity.',
          zh: '古称“太白”。东方晨见为“启明星”，夕见西方为“长庚星”。《诗经》“东有启明，西有长庚”。道家尊奉为太白金星长者。'
        }
      }
    },
    jupiter: {
      id: 'jupiter',
      name: 'Jupiter',
      nameCn: '木星 (岁星)',
      pinyin: 'Mùxīng',
      bayer: '♃ Jupiter',
      constellation: 'Planetary',
      constellationCn: '行星',
      spectralType: 'Gas Giant',
      distanceLy: 0.00008,
      summaryEn: 'King of the Planets; the Solar System’s largest gas giant with the iconic Great Red Spot.',
      summaryCn: '太阳系八大行星之王，巨大的气态行星，拥有著名的超级风暴大红斑。',
      astrophysics: {
        en: [
          'Apparent Magnitude: ~ -2.7 (second brightest planet).',
          'Contains 2.5 times the mass of all other planets in the Solar System combined.',
          'Orbital period: 11.86 Earth years (~1 year per zodiac sign).'
        ],
        zh: [
          '视星等约 -2.7，全天第二明亮行星。',
          '质量是太阳系所有其他行星总和的 2.5 倍。',
          '公转周期约 11.86 年，约每 12 年绕天一周，中国古代据此创制十二地支。'
        ]
      },
      mythology: {
        western: {
          en: 'Named after Jupiter, King of the Roman gods (Greek Zeus), ruler of the skies and thunder.',
          zh: '古罗马众神之王朱庇特（希腊宙斯），执掌雷霆与天界。'
        },
        chinese: {
          en: 'Known as "Suixing" (岁星 - The Year Star). Its ~12-year orbit founded China’s classic 12 Earthly Branches (十二地支) and Chinese Zodiac (生肖) calendar system.',
          zh: '古称“岁星”。因其十二年巡天一周，中国古代以此划分十二辰并创立干支生肖纪年法，为华夏传统历法之基石。'
        }
      }
    },
    mars: {
      id: 'mars',
      name: 'Mars',
      nameCn: '火星 (荧惑)',
      pinyin: 'Huǒxīng',
      bayer: '♂ Mars',
      constellation: 'Planetary',
      constellationCn: '行星',
      spectralType: 'Terrestrial Planet',
      distanceLy: 0.00002,
      summaryEn: 'The famous Red Planet, stained rust-red by iron oxide dust across vast arid deserts.',
      summaryCn: '著名的红色星球，表面氧化铁红锈铺就漫漫赤红沙海。',
      astrophysics: {
        en: [
          'Apparent Magnitude: -1.5 to +1.0 during opposition.',
          'Home to Olympus Mons (tallest planetary shield volcano at 22 km) and Valles Marineris canyon.',
          'Thin CO2 atmosphere with polar dry-ice caps.'
        ],
        zh: [
          '视星等冲日时可达 -1.5。',
          '拥有太阳系最高火山奥林匹斯山（高 22 公里）及巨型水手大峡谷。',
          '稀薄二氧化碳大气，两极覆盖由水冰与干冰构成的白色极冠。'
        ]
      },
      mythology: {
        western: {
          en: 'Named after Mars, Roman god of war (Greek Ares), owing to its fiery blood-red color.',
          zh: '古罗马战神玛尔斯（希腊阿瑞斯），因其血色红光如战火燎原得名。'
        },
        chinese: {
          en: 'Known as "Yinghuo" (荧惑 - Gleaming Bewilderment) for its fiery red, shifting trajectory. "Yinghuo Shou Xin" (Mars lingering near Antares) was feared as a classic astrological omen.',
          zh: '古称“荧惑”，因其红光荧荧、行走顺逆难测。“荧惑守心”（火星在心宿二逆行）在古代星占中被视作关乎帝王社稷安危的天文警示。'
        }
      }
    },
    saturn: {
      id: 'saturn',
      name: 'Saturn',
      nameCn: '土星 (镇星)',
      pinyin: 'Tǔxīng',
      bayer: '♄ Saturn',
      constellation: 'Planetary',
      constellationCn: '行星',
      spectralType: 'Gas Giant',
      distanceLy: 0.00015,
      summaryEn: 'The crowned jewel of the Solar System, adorned by magnificent concentric rings of glittering ice.',
      summaryCn: '太阳系中最为壮观的环系明珠，拥有夺目绚丽的冰晶光环系统。',
      astrophysics: {
        en: [
          'Apparent Magnitude: +0.4 (soft golden hue).',
          'Spectacular ring system spanning 282,000 km across, composed of 99% pure water-ice crystals.',
          'Orbital period: 29.45 Earth years (moving through ~1 Chinese lunar mansion per year).'
        ],
        zh: [
          '视星等约为 +0.4，呈温润淡金色。',
          '壮丽光环跨度达 28 万公里，厚度却仅有数十米，由纯净冰晶颗粒汇聚而成。',
          '公转周期约 29.5 年，在中国古代刚好每年留驻二十八宿中的一宿，古称“填星”或“镇星”。'
        ]
      },
      mythology: {
        western: {
          en: 'Named after Saturn, Roman god of agriculture, harvest, and time (Greek Cronus).',
          zh: '古罗马农神与时间之神萨图尔努斯（希腊克洛诺斯）。'
        },
        chinese: {
          en: 'Known as "Zhenxing" (镇星 - The Settling Star) or Tianxing (填星). Moving through roughly one of the 28 Mansions each year, it was regarded as an auspicious beacon of cosmic stability.',
          zh: '古称“镇星”或“填星”。《汉书·天文志》载：“岁填一宿，二十八宿凡二十八岁而周天”，古人视其为镇定祥和之星。'
        }
      }
    },
    mercury: {
      id: 'mercury',
      name: 'Mercury',
      nameCn: '水星 (辰星)',
      pinyin: 'Shuǐxīng',
      bayer: '☿ Mercury',
      constellation: 'Planetary',
      constellationCn: '行星',
      spectralType: 'Terrestrial Planet',
      distanceLy: 0.000006,
      summaryEn: 'Swift innermost planet of the Solar System, skimming close to the Sun with 600°C temperature swings.',
      summaryCn: '距离太阳最近、速度最快的行星，昼夜温差超过 600°C。',
      astrophysics: {
        en: [
          'Apparent Magnitude: -0.4 to +1.5.',
          'Orbital period: 88 Earth days (fastest planetary orbit).',
          'Maximum elongation from the Sun is only 28°, visible only briefly during dawn or dusk twilight.'
        ],
        zh: [
          '视星等约 -0.4。',
          '公转周期仅 88 天，为太阳系公转速度最快的行星。',
          '与太阳最大角距仅 28°，仅在黎明日出前或日落黄昏的薄暮微光中短暂露面。'
        ]
      },
      mythology: {
        western: {
          en: 'Named after Mercury, Roman fleet-footed messenger of the gods (Greek Hermes).',
          zh: '古罗马神界的飞毛腿信使墨丘利（希腊赫尔墨斯），因其在晨昏间迅疾游弋得名。'
        },
        chinese: {
          en: 'Known as "Chenxing" (辰星). Because it never wanders more than one "Chen" (30 degrees) from the Sun, its sightings served to calibrate the seasonal morning and evening hour standards.',
          zh: '古称“辰星”。因距太阳不出一辰（三十度），古人夜观辰星以正四时时辰。'
        }
      }
    },
    earth: {
      id: 'earth',
      name: 'Earth',
      nameCn: '地球',
      pinyin: 'Dìqiú',
      bayer: '♁ Terra',
      constellation: 'Ecliptic',
      constellationCn: '黄道',
      spectralType: 'Terrestrial Planet',
      distanceLy: 0.0000158,
      color: '#38bdf8',
      summaryEn: 'Home planet of humanity, shining as a brilliant sapphire "Pale Blue Dot" and prominent morning/evening planet in the Martian sky.',
      summaryCn: '人类的摇篮与家园。在火星苍穹中，地球化作一颗璀璨耀眼的蓝宝石晨昏星（“暗淡蓝点”），与月球相伴闪烁。',
      astrophysics: {
        en: [
          'Apparent magnitude from Mars: ~ -2.5 to -1.5 (often brighter than Jupiter).',
          'Orbits Sun at 1.00 AU; distance from Mars varies between 0.37 AU and 2.68 AU.',
          'Distinctive vibrant sapphire blue hue due to atmospheric Rayleigh scattering and global liquid oceans.',
          'Through a telescope from Mars, Earth and Moon form an exquisite binary planet dance.'
        ],
        zh: [
          '从火星观测的视星等：约 -2.5 至 -1.5（亮度常超过木星）。',
          '日心距离 1.00 AU；与火星距离在 0.37 至 2.68 AU 之间变化。',
          '因大气瑞利散射和广袤海洋，呈现标志性的湛蓝宝石光芒。',
          '若在火星使用望远镜，可清晰看见地月双星系统相伴共舞。'
        ]
      },
      mythology: {
        western: {
          en: 'In Greek and Roman mythology, personified as Gaia / Terra Mater, the primordial Mother Earth and ancestral mother of all life.',
          zh: '古希腊与罗马神话中的原始大地女神盖亚（Gaia / Terra Mater），万物之母与生命繁衍之源。'
        },
        chinese: {
          en: 'In Chinese antiquity, the Earth is revered as "Hou Tu" (后土, Sovereign Earth), paired with Heaven (Huang Tian, 皇天) in the cosmic balance of Yin and Yang.',
          zh: '华夏上古尊为“后土皇地祇”，与“皇天上帝”对举，承载山川厚德载物，统御九州大地。'
        }
      }
    },
    phobos: {
      id: 'phobos',
      name: 'Phobos',
      nameCn: '火卫一 (福波斯)',
      pinyin: 'Huǒwèi Yī',
      bayer: '♂ I Phobos',
      constellation: 'Mars Orbit',
      constellationCn: '火星轨道',
      spectralType: 'Martian Moon (C-type)',
      color: '#cbd5e1',
      summaryEn: 'The larger and closer of Mars’ two moons, hurtling across the Martian sky from west to east twice every Martian sol.',
      summaryCn: '火星最大且最近的天然卫星。以极快速度自西向东横穿火星天空，每个火星日升落两次以上。',
      astrophysics: {
        en: [
          'Mean orbit radius: 9,376 km (only ~6,000 km above Mars surface).',
          'Orbital period: 7h 39m (faster than Mars rotation, causing it to rise in the west and set in the east).',
          'Apparent visual magnitude: ~ -1.5 (bright, prominent disc in Martian sky).',
          'Heavily cratered, non-spherical asteroid moon featuring the giant Stickney impact crater.'
        ],
        zh: [
          '平均轨道半径：9,376 公里（距火星地表仅约 6,000 公里）。',
          '公转周期：7小时39分（比火星自转更快，因此在火星天空中西升东落）。',
          '视星等：约 -1.5（亮度显著，视直径约占月球的三分之一）。',
          '表面布满撞击坑的不规则天体，最著名的是巨大的斯蒂克尼撞击坑。'
        ]
      },
      mythology: {
        western: {
          en: 'Named after Phobos, the Greek god of panic and fear, son of Ares (Mars) and Aphrodite.',
          zh: '以希腊战神阿瑞斯（火星）与阿佛洛狄忒之子、恐慌与怖惧之神福波斯（Phobos）命名。'
        },
        chinese: {
          en: 'Designated in Chinese astronomy as Huowei Yi (火卫一), the primary sentinel moon of the Fire Planet (Mars).',
          zh: '中国天文学官方定名为火卫一，意为荧惑（火星）的第一守护随侍之星。'
        }
      }
    },
    deimos: {
      id: 'deimos',
      name: 'Deimos',
      nameCn: '火卫二 (戴莫斯)',
      pinyin: 'Huǒwèi Èr',
      bayer: '♂ II Deimos',
      constellation: 'Mars Orbit',
      constellationCn: '火星轨道',
      spectralType: 'Martian Moon (C-type)',
      color: '#e2e8f0',
      summaryEn: 'The outer and smaller moon of Mars, appearing as a bright, luminous celestial beacon in the Martian night sky.',
      summaryCn: '火星较小且较远的天然外层卫星。在火星夜空中呈现为一颗明亮璀璨的星辰般指路天标。',
      astrophysics: {
        en: [
          'Mean orbit radius: 23,463 km.',
          'Orbital period: 30.3 hours (just slower than Mars’ 24.6h sol).',
          'Apparent visual magnitude: ~ +1.8 (clearly visible to the naked eye like a steady morning or evening star).',
          'Smooth surface blanketed by a thick layer of regolith dust.'
        ],
        zh: [
          '平均轨道半径：23,463 公里。',
          '公转周期：30.3 小时（比火星自转的 24.6 小时略慢，因此东升西落耗时极长）。',
          '视星等：约 +1.8（肉眼清晰可见，如一颗耀眼的恒星般缓缓划过长空）。',
          '表面较平滑，覆盖着数米厚的细腻风化层尘埃。'
        ]
      },
      mythology: {
        western: {
          en: 'Named after Deimos, the Greek god of dread and terror, brother of Phobos and companion of Ares.',
          zh: '以希腊神话中战神阿瑞斯之子、畏惧与战栗之神戴莫斯（Deimos）命名，与福波斯为孪生随从。'
        },
        chinese: {
          en: 'Designated in Chinese astronomy as Huowei Er (火卫二), the outer companion moon of Mars.',
          zh: '中国天文学定名为火卫二，为火星的外层伴星。'
        }
      }
    }
  };

  const ISS_METADATA = {
    id: 'iss',
    name: 'ISS (Space Station)',
    nameCn: '国际空间站 (ISS)',
    pinyin: 'Guójì Kōngjiānzhàn',
    bayer: '🛰️ NORAD 25544',
    constellation: 'Low Earth Orbit',
    constellationCn: '近地轨道 (LEO)',
    spectralType: 'Space Station',
    distanceLy: 0.000000044,
    color: '#38bdf8',
    summaryEn: 'Largest human outpost in space; orbiting Earth at 27,600 km/h (17,500 mph) once every 93 minutes.',
    summaryCn: '人类最大的在轨太空堡垒，以时速 2.76 万公里（每 93 分钟）环绕地球一周。',
    astrophysics: {
      en: [
        'Orbital Altitude: ~418 km (Low Earth Orbit).',
        'Orbital Velocity: ~7.66 km/s (27,600 km/h / 17,500 mph).',
        'Orbital Period: 92.9 minutes (~15.5 revolutions around Earth per day).',
        'Physical Dimensions: 109 meters across with 1-acre solar array wings generating 120 kW electrical power.',
        'Total Mass: ~450,000 kg (990,000 lbs).',
        'Continuous human presence in space since November 2, 2000.'
      ],
      zh: [
        '轨道高度：平均约 418 公里（近地微重力轨道）。',
        '运行速度：每秒约 7.66 公里（时速 27,600 公里）。',
        '公转周期：约 92.9 分钟（每日绕地球飞越 15.5 圈，宇航员一天亲历 16 次日出日落）。',
        '物理尺寸：主桁架跨度 109 米（相当于一个标准足球场），太阳能电池翼面积超 4000 平方米。',
        '在轨质量：约 450 吨。',
        '自 2000 年 11 月 2 日以来，始终有宇航员在此连续常驻值守。'
      ]
    },
    culturalHistory: {
      western: [
        'Built by a historic global partnership of 15 nations (NASA, Roscosmos, ESA, JAXA, and CSA).',
        'Assembly began in November 1998 with the launch of the Zarya control module.',
        'Continuous human habitation for over 25 years with more than 270 astronauts from 21 nations.'
      ],
      chinese: [
        '常驻三位或更多宇航员，成为人类探索深空与微重力生命科学最重要的前哨基地。',
        '晨昏时分在阳光反射下亮度可匹敌金星，肉眼清晰可见其静谧飞越天际。',
        '见证了人类和平探索宇宙、跨越国界的共同科学理想。'
      ]
    },
    mythology: {
      western: {
        en: 'The pinnacle of international human cooperation in exploration, built by NASA (USA), Roscosmos (Russia), ESA (Europe), JAXA (Japan), and CSA (Canada). Astronauts look back at Earth from the Cupola dome, inspired by the "Overview Effect".',
        zh: '人类和平探索宇宙最宏伟的国际合作丰碑，由美、俄、欧、日、加等国联合建造。航天员在圆顶观测舱（Cupola）凝望蔚蓝母港，亲历感悟震撼心灵的“总观效应”（Overview Effect）。'
      },
      chinese: {
        en: 'Named "Guoji Kongjianzhan". When illuminated by sunlight against the dusk or dawn sky, its massive solar arrays reflect bright gleams rivaling Venus or Jupiter, flying swiftly from horizon to horizon in under 5 minutes.',
        zh: '晨昏薄暮时分，其巨幅太阳能帆板反射灿烂阳光，在夜空中如同一颗明亮胜过木星或金星的金色飞星，在短短 4 至 6 分钟内掠过浩瀚苍穹，令人惊叹。'
      }
    }
  };

  // ==========================================================================
  // Popular Man-Made Spacecraft & Satellites Database
  // LEO Stations & Telescopes, Lagrange Observatories, and Interstellar Probes
  // ==========================================================================
  const SPACECRAFT_DATA = [
    {
      ...ISS_METADATA,
      craftType: 'leo_station',
      iconEmoji: '🛰️',
      color: '#38bdf8'
    },
    {
      id: 'hubble',
      name: 'Hubble Space Telescope (HST)',
      nameCn: '哈勃空间望远镜',
      pinyin: 'Hābó Kōngjiān Wàngyuǎnjìng',
      bayer: '🔭 NORAD #20580',
      constellation: 'Low Earth Orbit',
      constellationCn: '近地轨道 (LEO)',
      craftType: 'leo_telescope',
      iconEmoji: '🔭',
      color: '#93c5fd',
      spectralType: 'Space Observatory',
      distanceLy: 0.000000055, // ~525 km
      orbitAltitudeKm: 525,
      inclinationDeg: 28.47,
      periodMin: 95.4,
      mag: 1.8,
      summaryEn: 'Legendary orbital observatory that revolutionized modern astrophysics and revealed the deep universe for over 35 years.',
      summaryCn: '人类天文史上最传奇的在轨太空望远镜，服役逾35年，深刻改写了现代宇宙学。',
      astrophysics: {
        en: [
          'Primary Mirror: 2.4-meter (7.9 ft) Ritchey-Chrétien optical reflector.',
          'Orbital Altitude: ~525 km above Earth, inclined at 28.5° to the equator.',
          'Orbital Period: 95.4 minutes (circling Earth ~15 times per day at 27,300 km/h).',
          'Wavelength Coverage: Ultraviolet, visible light, and near-infrared (115–2500 nm).',
          'Key Discoveries: Measured the accelerating expansion rate of the universe (Hubble constant), captured the iconic Hubble Deep Fields, and confirmed supermassive black holes at galactic centers.'
        ],
        zh: [
          '主镜口径：2.4 米高精度里奇-克莱琴式反射镜。',
          '运行轨道：平均高度约 525 公里，倾角 28.5°。',
          '公转周期：约 95.4 分钟，以时速 2.73 万公里每日绕地球飞越约 15 圈。',
          '观测波段：紫外线、可见光与近红外线（115 至 2500 纳米）。',
          '重大功绩：精确测定宇宙加速膨胀与哈勃常数，拍摄震撼世人的哈勃深空场（Hubble Deep Field），证实超大质量黑洞普遍存在于星系核心。'
        ]
      },
      culturalHistory: {
        western: {
          en: 'Launched April 24, 1990 aboard Space Shuttle Discovery (STS-31). Named after Edwin Hubble, who discovered that the universe is expanding. Serviced in orbit 5 times by brave Shuttle astronauts.',
          zh: '1990 年 4 月 24 日由发现号航天飞机（STS-31）送入太空。以发现宇宙膨胀的著名天文学家埃德温·哈勃命名。宇航员曾 5 次搭乘航天飞机进行英勇的太空在轨维修升级。'
        },
        chinese: {
          en: 'Known as "Habo Wangyuanjing". Generations of stargazers grew up admiring its mesmerizing images of the Pillars of Creation and distant interacting galaxies.',
          zh: '中文常称“哈勃望远镜”。数代天文爱好者在哈勃拍摄的“创生之柱”（Pillars of Creation）、草帽星系等壮美宇宙图像熏陶下启蒙成长。'
        }
      }
    },
    {
      id: 'tiangong',
      name: 'Tiangong Space Station (CSS)',
      nameCn: '中国天宫空间站',
      pinyin: 'Tiāngōng Kōngjiānzhàn',
      bayer: '🇨🇳 NORAD #48274',
      constellation: 'Low Earth Orbit',
      constellationCn: '近地轨道 (LEO)',
      craftType: 'leo_station',
      iconEmoji: '🏮',
      color: '#f87171',
      spectralType: 'Modular Space Station',
      distanceLy: 0.000000041, // ~390 km
      orbitAltitudeKm: 390,
      inclinationDeg: 41.5,
      periodMin: 92.2,
      mag: -1.8,
      summaryEn: 'China’s permanent crewed modular space station, continuously inhabited and hosting cutting-edge microgravity physics experiments.',
      summaryCn: '中国国家太空实验室，由天和核心舱、问天实验舱与梦天实验舱组成T字构型，航天员常态化在轨驻留。',
      astrophysics: {
        en: [
          'Orbital Altitude: ~380–400 km in Low Earth Orbit at 41.5° inclination.',
          'Orbital Period: 92.2 minutes (speed ~27,600 km/h).',
          'Configuration: T-shaped basic structure formed by Tianhe core module, Wentian lab, and Mengtian lab.',
          'Power: State-of-the-art flexible gallium-arsenide solar wings producing over 27 kW electric power.',
          'Science Payload: Ultra-cold atomic clock ensemble, microgravity fluid physics, and material science racks.'
        ],
        zh: [
          '轨道高度：平均约 380 至 400 公里，轨道倾角 41.5°。',
          '公转周期：约 92.2 分钟（运行速度约 7.68 km/s，时速 2.76 万公里）。',
          '主体构型：天和核心舱居中，问天、梦天实验舱在两侧对称停泊，构成百吨级T字基本构型。',
          '动力能源：搭载先进柔性格化镓三结太阳翼，光电转换效率全球领先。',
          '科学设施：配备高精度空间冷原子钟光钟组、微重力流体物理与空间材料科学实验柜。'
        ]
      },
      culturalHistory: {
        western: {
          en: 'Named "Tiangong" meaning "Heavenly Palace". Completed in 2022, it provides humanity with a continuous research outpost alongside the ISS in low Earth orbit.',
          zh: '西方称“Heavenly Palace”。于 2022 年底全面建成转入应用发展阶段，与国际空间站共同守望地球近地轨道。'
        },
        chinese: {
          en: 'Derived from Chinese mythology of the Jade Emperor\'s heavenly celestial palace. Shenzhou crews conduct national science lessons ("Tiangong Class") broadcast live to millions of students.',
          zh: '取名自中华古代神话中玉皇大帝与众仙居所“天宫”。航天员乘组多次面向全国数以亿计青少年开展“天宫课堂”太空科普直播。'
        }
      }
    },
    {
      id: 'jwst',
      name: 'James Webb Space Telescope (JWST)',
      nameCn: '詹姆斯·韦布空间望远镜',
      pinyin: 'Wéibù Kōngjiān Wàngyuǎnjìng',
      bayer: '✨ Sun-Earth L2 (Halo)',
      constellation: 'Sun-Earth Lagrange L2',
      constellationCn: '日地拉格朗日L2点',
      craftType: 'lagrange_telescope',
      iconEmoji: '🔭',
      color: '#fbbf24',
      spectralType: 'Infrared Space Observatory',
      distanceLy: 0.000158, // ~1,500,000 km (~5 light-seconds)
      distKm: 1500000,
      mag: 13.5, // Not naked eye, but iconic in sky direction
      summaryEn: 'Humanity’s premier infrared deep-space observatory stationed at Sun-Earth L2, peering back 13.5 billion years to cosmic dawn.',
      summaryCn: '位于日地第二拉格朗日点（L2）的金色旗舰级红外空间望远镜，穿透宇宙尘埃回望135亿年前第一代恒星与星系。',
      astrophysics: {
        en: [
          'Location: Halo orbit around Sun-Earth Lagrange Point 2 (L2), 1.5 million km from Earth in the anti-sunward direction.',
          'Primary Mirror: 6.5-meter (21.3 ft) gold-coated beryllium reflector made of 18 hexagonal segments.',
          'Sunshield: 5-layer Kapton membrane the size of a tennis court, maintaining science instruments at -233°C (40 K).',
          'Instruments: NIRCam, NIRSpec, MIRI (cooled to 7 K by helium cryocooler), and FGS/NIRISS.',
          'Groundbreaking Discoveries: Detected the earliest luminous galaxies ever seen ($z > 14$), carbon dioxide and water vapor in exoplanet atmospheres, and stellar birth nurseries in unprecedented detail.'
        ],
        zh: [
          '空间位置：环绕日地第二拉格朗日点（L2）的光环轨道（Halo Orbit），距地球约 150 万公里（背向太阳侧）。',
          '主反射镜：6.5 米口径超大镀金铍镜，由 18 块六边形子镜精密拼合而成。',
          '遮阳帆板：网球场大小的五层高阻隔聚酰亚胺薄膜，为仪器提供 -233°C（40K）极低温工作环境。',
          '核心载荷：近红外相机（NIRCam）、近红外光谱仪、中红外仪器（MIRI，氦制冷机深冷至 7K）。',
          '巅峰突破：探测到宇宙大爆炸后仅 3 亿年形成的极早期星系（红移 $z > 14$），首次在太阳系外行星大气层中确认二氧化碳和水蒸气特征。'
        ]
      },
      culturalHistory: {
        western: {
          en: 'Launched on Christmas Day, December 25, 2021 aboard an Ariane 5 from French Guiana. Joint mission of NASA, ESA, and CSA. Executed a flawless 30-day autonomous deep space origami deployment.',
          zh: '2021 年圣诞节由阿丽亚娜 5 型火箭从法属圭亚那发射升空。由 NASA、欧空局（ESA）和加拿大航天局（CSA）联合研制。在深空中上演了人类航天史上最复杂的“宇宙折纸展开”。'
        },
        chinese: {
          en: 'Referred to widely in China as "Weibu Wangyuanjing". Its golden hexagonal honeycomb mirror is an internationally recognized icon of cutting-edge human discovery.',
          zh: '国内常尊称“韦布望远镜”。其金色蜂窝六边形主镜与网球场巨幕遮阳帆已成为 21 世纪人类探索宇宙深邃极限的科学图腾。'
        }
      }
    },
    {
      id: 'voyager1',
      name: 'Voyager 1 (Interstellar Probe)',
      nameCn: '旅行者1号星际探测器',
      pinyin: 'Lǚxíngzhě Yīhào',
      bayer: '🛸 Interstellar Deep Space',
      constellation: 'Ophiuchus',
      constellationCn: '蛇夫座',
      craftType: 'interstellar_probe',
      iconEmoji: '🛰️',
      color: '#a78bfa',
      spectralType: 'Interstellar Robotic Probe',
      ra: 17.25, // Constellation Ophiuchus
      dec: 12.33,
      distanceLy: 0.00258, // ~163.5 AU (~24.46 billion km / 22.6 light-hours)
      distAU: 163.5,
      distKm: 24460000000,
      velocityKms: 16.9,
      mag: 99.0, // Fictional magnitude for sky tracking
      summaryEn: 'The farthest human-made object in the universe; traveling through interstellar space ~24.5 billion km away, bearing Earth’s Golden Record.',
      summaryCn: '人类有史以来飞得最远的人造飞行器；已飞出太阳圈层进入星际空间（距地球约245亿公里，单程光信号需22.6小时）。',
      astrophysics: {
        en: [
          'Distance from Earth: Over 163.5 Astronomical Units (~24.46 billion km, ~22.65 light-hours away).',
          'Current Location: Constellation Ophiuchus (RA ~17h 15m, Dec ~+12° 20\'), traveling outward at 16.9 km/s (38,000 mph).',
          'Interstellar Crossing: Officially crossed the heliopause into true interstellar space on August 25, 2012.',
          'Power Source: Radioisotope Thermoelectric Generators (RTGs) powered by decaying plutonium-238.',
          'Historic Discoveries: First detailed views of Jupiter’s rings and active volcanoes on Io; discovered Saturn’s complex ring structure.'
        ],
        zh: [
          '距地距离：已超过 163.5 个天文单位（约 244.6 亿公里，无线电单程光速通信需 22.65 小时）。',
          '天空天区：位于蛇夫座天区（赤经 17h 15m，赤纬 +12° 20\'），正以每秒 16.9 公里（时速 6.1 万公里）向银心方向飞驰。',
          '星际飞跃：2012 年 8 月 25 日正式冲出太阳圈顶层（Heliopause），成为首个驶入真正星际空间的使者。',
          '核能动力：搭载放射性同位素温差热电发电机（RTG，以钚-238衰变热能供电）。',
          '历史发现：首次拍到木星微弱光环与木卫一超级活火山喷发；揭示土星环精细缠结结构。'
        ]
      },
      culturalHistory: {
        western: {
          en: 'Launched September 5, 1977. Carries the famous Golden Record curated by Carl Sagan, containing greetings in 55 languages, sounds of Earth, and music from Bach to Chuck Berry, destined to wander the Milky Way for billions of years.',
          zh: '1977 年 9 月 5 日发射。携带着由卡尔·萨根团队精心编撰的镀金铜质唱片《地球之声》（The Golden Record），收录了 55 种人类语言问候、地球自然声音与巴赫等音乐，将在银河系中漂流数十亿年。'
        },
        chinese: {
          en: 'In Chinese culture, Voyager 1 is celebrated as the ultimate cosmic wanderer, continuing to transmit scientific whispers from the cold void between the stars.',
          zh: '在中华文化语境中，旅行者 1 号被誉为“最坚毅的人类宇宙游子”。在零下 270 度的幽暗虚空之中，仍在微弱传回星际等离子体的科学讯号。'
        }
      }
    },
    {
      id: 'voyager2',
      name: 'Voyager 2 (Interstellar Probe)',
      nameCn: '旅行者2号星际探测器',
      pinyin: 'Lǚxíngzhě Èrhào',
      bayer: '🛸 Interstellar Deep Space',
      constellation: 'Pavo',
      constellationCn: '孔雀座',
      craftType: 'interstellar_probe',
      iconEmoji: '🛰️',
      color: '#c084fc',
      spectralType: 'Interstellar Robotic Probe',
      ra: 20.17, // Constellation Pavo / Telescopium
      dec: -59.67,
      distanceLy: 0.00215, // ~136.2 AU (~20.37 billion km / 18.8 light-hours)
      distAU: 136.2,
      distKm: 20370000000,
      velocityKms: 15.3,
      mag: 99.0,
      summaryEn: 'The only spacecraft to explore the ice giants Uranus and Neptune; now sailing into interstellar space ~20.4 billion km away.',
      summaryCn: '人类历史上唯一近距离造访过天王星与海王星的飞船；现正穿行于星际空间，距地球约204亿公里。',
      astrophysics: {
        en: [
          'Distance from Earth: Over 136.2 Astronomical Units (~20.37 billion km, ~18.85 light-hours away).',
          'Current Location: Southern constellation Pavo (RA ~20h 10m, Dec ~-59° 40\'), heading south of the ecliptic plane.',
          'Interstellar Crossing: Entered interstellar space on November 5, 2018 with its plasma science experiment intact.',
          'Grand Tour: Completed the historic "Grand Tour" of Jupiter (1979), Saturn (1981), Uranus (1986), and Neptune (1989).',
          'Discoveries: Discovered the Great Dark Spot and supersonic winds on Neptune, and nitrogen ice geysers on Triton.'
        ],
        zh: [
          '距地距离：已超过 136.2 个天文单位（约 203.7 亿公里，无线电单程光速通信需 18.85 小时）。',
          '天空天区：位于南天孔雀座天区（赤经 20h 10m，赤纬 -59° 40\'），正朝向黄道以南的星际空间航行。',
          '星际飞跃：2018 年 11 月 5 日穿越太阳圈层，且其等离子体探测器保持完好运行，直接量测到了星际带电粒子。',
          '行星盛宴：完成了人类航天史上唯一的“四大外行星大巡游”（木星、土星、天王星、海王星）。',
          '经典发现：首次揭示海王星大暗斑与超音速风暴，拍摄到海卫一惊人的液氮冰火山喷泉。'
        ]
      },
      culturalHistory: {
        western: {
          en: 'Launched August 20, 1977 (16 days before Voyager 1). Also carries a duplicate Golden Record. Its triumphant exploration of the outer gas and ice giants represents one of humanity\'s crowning technical achievements.',
          zh: '1977 年 8 月 20 日发射（比旅行者 1 号早 16 天）。同样搭载一枚镀金《地球之声》唱片。其对天王星、海王星两颗幽蓝冰巨星的开创性探访，堪称人类工业文明的巅峰绝唱。'
        },
        chinese: {
          en: 'Celebrated for giving humanity our first real glimpses of turquoise Uranus and azure Neptune, Voyager 2 inspires all who dream of journeying past the edge of the Sun’s realm.',
          zh: '它为人类首次揭开了天王星青绿如玉、海王星蔚蓝如海的神秘面纱，永远铭刻在人类文明仰望星空的浩瀚史册上。'
        }
      }
    }
  ];

  // Also build lookup dictionary by id
  const SPACECRAFT_METADATA = {};
  SPACECRAFT_DATA.forEach((craft) => {
    craft.mythology = craft.culturalHistory;
    SPACECRAFT_METADATA[craft.id] = craft;
  });

  // ==========================================================================
  // Upcoming Celestial Events (2026 - 2027)
  // Scraped & Curated from Official Astronomical Calendars (Royal Obs, Time & Date, NASA)
  // Ranked by Rarity, Visual Impact, and Proximity to Today
  // ==========================================================================
  const CELESTIAL_EVENTS = [
    {
      id: 'evt-uranus-opp-2026',
      titleEn: 'Uranus at Opposition',
      titleZh: '天王星冲日',
      dateStr: '2026-11-25',
      dateDisplayEn: 'Nov 25, 2026',
      dateDisplayZh: '2026年11月25日',
      relativeEn: 'In 4 days',
      relativeZh: '4天后',
      rarity: 3, // out of 5 stars
      category: 'opposition',
      targetId: 'uranus',
      targetType: 'planet',
      targetNameEn: 'Uranus (in Taurus)',
      targetNameZh: '天王星 (金牛座/昴星团旁)',
      ra: 3.52,
      dec: 18.75,
      summaryEn: 'Uranus is closest to Earth and brightest of the entire year (mag 5.6). Visible all night with binoculars as a distinct cyan-green disk near the Pleiades.',
      summaryZh: '天王星位于近日点且正对太阳，整夜可见，视星等达到全年度最亮的 5.6 等，在双筒望远镜中呈现清晰的青绿色微型圆盘。',
      viewingTipEn: 'Use binoculars or a small telescope looking toward Taurus east of the Pleiades (Subaru cluster).',
      viewingTipZh: '使用双筒望远镜或小型天文望远镜对准金牛座昴星团偏东方向，可清晰捕捉其青绿星芒。'
    },
    {
      id: 'evt-geminids-2026',
      titleEn: 'Geminids Meteor Shower Peak',
      titleZh: '双子座流星雨极大期 (年度流星之王)',
      dateStr: '2026-12-13',
      dateDisplayEn: 'Dec 13–14, 2026',
      dateDisplayZh: '2026年12月13日–14日',
      relativeEn: 'In 3 weeks',
      relativeZh: '约3周后',
      rarity: 5,
      category: 'meteor_shower',
      targetId: 'castor', // Radiant near Castor & Pollux in Gemini
      targetType: 'star',
      targetNameEn: 'Gemini Radiant (Castor & Pollux)',
      targetNameZh: '双子座辐射点 (北河二 / 北河三)',
      ra: 7.46,
      dec: 32.50,
      summaryEn: 'The undisputed King of annual meteor showers! Yielding up to 120 multicolored, slow-moving fireballs per hour originating from rocky asteroid 3200 Phaethon.',
      summaryZh: '北半球全年最壮丽的“流星之王”！极大期每小时天顶流量（ZHR）可达 120 颗以上，流星体源自 3200 号法厄同小行星，速度适中、色彩斑斓且火流星频发。',
      viewingTipEn: 'Dress warmly and face toward Gemini overhead after midnight. No telescope needed — naked eyes offer the widest view.',
      viewingTipZh: '午夜后双子座升至头顶中天，视野开阔无遮挡处肉眼观赏最佳，无需望远镜。'
    },
    {
      id: 'evt-solstice-2026',
      titleEn: 'December Winter Solstice',
      titleZh: '冬至日 (北半球最长黑夜)',
      dateStr: '2026-12-21',
      dateDisplayEn: 'Dec 21, 2026',
      dateDisplayZh: '2026年12月21日',
      relativeEn: 'In 1 month',
      relativeZh: '约1个月后',
      rarity: 3,
      category: 'equinox_solstice',
      targetId: 'sun',
      targetType: 'solar',
      targetNameEn: 'The Sun (Tropic of Capricorn)',
      targetNameZh: '太阳 (直射南回归线)',
      ra: 18.0,
      dec: -23.44,
      summaryEn: 'Sun reaches its southernmost declination (-23.44°). The Northern Hemisphere experiences the shortest day and longest night of the year — prime time for deep stargazing.',
      summaryZh: '太阳直射南回归线，北半球迎来一年中白昼最短、黑夜最漫长的一天，为整夜深空天体巡天观测提供了最充裕的暗夜窗口。',
      viewingTipEn: 'Take advantage of over 14 hours of continuous dark skies to observe deep-sky nebulae and the Orion arm.',
      viewingTipZh: '利用长达 14 小时以上的连贯夜空，静心巡览冬季大三角、猎户座大星云及昴星团。'
    },
    {
      id: 'evt-quadrantids-2027',
      titleEn: 'Quadrantids Meteor Shower Peak',
      titleZh: '象限仪座流星雨极大期',
      dateStr: '2027-01-03',
      dateDisplayEn: 'Jan 3–4, 2027',
      dateDisplayZh: '2027年1月3日–4日',
      relativeEn: 'Early Jan 2027',
      relativeZh: '2027年1月初',
      rarity: 4,
      category: 'meteor_shower',
      targetId: 'polaris',
      targetType: 'star',
      targetNameEn: 'Boötes / Ursa Major Radiant',
      targetNameZh: '象限仪辐射点 (牧夫座/北斗七星之间)',
      ra: 15.33,
      dec: 49.50,
      summaryEn: 'One of the top 3 annual meteor showers, renowned for a razor-sharp 4-hour peak with rates exceeding 110 meteors/hour glowing with blue and yellow hues.',
      summaryZh: '北半球三大流星雨之一，具有爆发力极强但峰值窗口极其短暂（仅约4小时）的特点，ZHR高达到 110 颗/小时。',
      viewingTipEn: 'Look northeast in the pre-dawn hours between Boötes, Draco, and the handle of the Big Dipper.',
      viewingTipZh: '黎明前朝向东北方高空（北斗七星斗柄与牧夫座大角星之间）凝望。'
    },
    {
      id: 'evt-mars-jupiter-2027',
      titleEn: 'Mars & Jupiter Great Conjunction',
      titleZh: '火星木星双星大交会',
      dateStr: '2027-01-18',
      dateDisplayEn: 'Jan 18, 2027',
      dateDisplayZh: '2027年1月18日',
      relativeEn: 'Jan 2027',
      relativeZh: '2027年1月中旬',
      rarity: 4,
      category: 'conjunction',
      targetId: 'jupiter',
      targetType: 'planet',
      targetNameEn: 'Jupiter & Mars Alignment',
      targetNameZh: '木星与火星交会点 (狮子座天区)',
      ra: 9.85,
      dec: 14.20,
      summaryEn: 'A breathtaking close planetary approach! Ruddy Mars and brilliant golden Jupiter blaze side-by-side within a single binocular field of view in Leo.',
      summaryZh: '极具观赏性的行星相合！赤红的火星与璀璨金黄的巨行星木星在狮子座天区紧密靠拢，同框跃入双筒望远镜视场。',
      viewingTipEn: 'Easily visible to the naked eye after 10 PM. A small telescope reveals Jupiter’s cloud bands and 4 moons right beside Mars.',
      viewingTipZh: '晚间 10 点后肉眼即可轻松看到两颗亮星依偎相伴，望远镜更可在同一视野收揽木星四颗伽利略卫星与火星赤红光晕。'
    },
    {
      id: 'evt-annular-solar-2027',
      titleEn: 'Annular Solar Eclipse (Ring of Fire)',
      titleZh: '南半球日环食 (壮丽金环)',
      dateStr: '2027-02-06',
      dateDisplayEn: 'Feb 6, 2027',
      dateDisplayZh: '2027年2月6日',
      relativeEn: 'Feb 2027',
      relativeZh: '2027年2月上旬',
      rarity: 5,
      category: 'eclipse',
      targetId: 'sun',
      targetType: 'solar',
      targetNameEn: 'The Sun (Ring of Fire Eclipse)',
      targetNameZh: '太阳 (日环食交会点)',
      ra: 21.35,
      dec: -15.42,
      summaryEn: 'The Moon passes directly in front of the Sun but is near apogee, creating a radiant "Ring of Fire" across South America, Atlantic, and Antarctica.',
      summaryZh: '月球运行至远地点前后直贯日面中央，形成壮丽耀眼的“金指环”，环食带穿过智利、阿根廷及南极洲。',
      viewingTipEn: 'Requires ISO 12312-2 certified solar eclipse viewing filters at all times during annularity.',
      viewingTipZh: '观测全过程必须全程佩戴符合 ISO 12312-2 国际标准的专业日食观测滤镜或日珥镜。'
    },
    {
      id: 'evt-jupiter-opp-2027',
      titleEn: 'Jupiter at Opposition (Peak Brightness)',
      titleZh: '木星冲日 (全年最大最亮)',
      dateStr: '2027-02-11',
      dateDisplayEn: 'Feb 11, 2027',
      dateDisplayZh: '2027年2月11日',
      relativeEn: 'Feb 2027',
      relativeZh: '2027年2月中旬',
      rarity: 5,
      category: 'opposition',
      targetId: 'jupiter',
      targetType: 'planet',
      targetNameEn: 'Jupiter (Leo / Cancer)',
      targetNameZh: '木星 (冲日位置)',
      ra: 9.75,
      dec: 15.05,
      summaryEn: 'The King of Planets reaches opposition! Closest to Earth, shining brilliantly at magnitude -2.6. Visible all night; Great Red Spot and 4 Galilean moons in sharpest relief.',
      summaryZh: '行星之王迎来年度冲日！此时木星距地球最近、视直径达 45 角秒、视星等达到耀眼的 -2.6 等，整夜如明灯悬照，大红斑与四颗伽利略卫星轮廓分明。',
      viewingTipEn: 'Any entry-level telescope will reveal the equatorial cloud belts and shadows of Io, Europa, Ganymede, and Callisto.',
      viewingTipZh: '任何入门级天文望远镜均可清晰饱览其红白相间的云带风暴与木卫阴影凌木奇观。'
    },
    {
      id: 'evt-mars-opp-2027',
      titleEn: 'Mars at Opposition (Double Opposition)',
      titleZh: '火星冲日 (双星双冲大年)',
      dateStr: '2027-02-19',
      dateDisplayEn: 'Feb 19, 2027',
      dateDisplayZh: '2027年2月19日',
      relativeEn: 'Feb 2027',
      relativeZh: '2027年2月中旬',
      rarity: 5,
      category: 'opposition',
      targetId: 'mars',
      targetType: 'planet',
      targetNameEn: 'Mars (Opposition in Leo)',
      targetNameZh: '火星 (狮子座冲日点)',
      ra: 10.22,
      dec: 13.15,
      summaryEn: 'Rare double opposition alongside Jupiter! The Red Planet shines ablaze at magnitude -1.2, offering astronomers crisp views of its polar ice caps and dark volcanic plains.',
      summaryZh: '极为罕见的“木星-火星双星双冲日”天文年！战神之星火星以 -1.2 等亮度赤红耀目，极冠干冰冰盖与大流沙反照率地貌清晰可见。',
      viewingTipEn: 'Use high magnification (150x+) with a red or orange filter to resolve Syrtis Major and the polar cap.',
      viewingTipZh: '使用 150 倍以上目镜配合橙色滤镜，可清晰鉴别火星北极冠白斑与大瑟提斯高原阴影。'
    },
    {
      id: 'evt-lunar-eclipse-2027',
      titleEn: 'Total Lunar Eclipse (Blood Moon)',
      titleZh: '元宵月全食 (壮丽红月亮)',
      dateStr: '2027-02-20',
      dateDisplayEn: 'Feb 20–21, 2027',
      dateDisplayZh: '2027年2月20日–21日',
      relativeEn: 'Feb 2027',
      relativeZh: '2027年2月下旬',
      rarity: 5,
      category: 'eclipse',
      targetId: 'moon',
      targetType: 'solar',
      targetNameEn: 'The Moon (Total Umbral Eclipse)',
      targetNameZh: '月亮 (地影全食红月)',
      ra: 10.45,
      dec: 10.85,
      summaryEn: 'A total lunar eclipse bathing the Full Moon in deep coppery red starlight refracted through all of Earth’s sunrises and sunsets simultaneously.',
      summaryZh: '月全食登场！月球完全步入地球本影深处，全球所有日出日落的红光经由地球大气折射投射在月表上，呈现深邃神秘的古铜色“血月”。',
      viewingTipEn: 'Completely safe for direct naked-eye, binocular, or telescopic viewing across the Americas, Europe, and Africa.',
      viewingTipZh: '肉眼及双筒望远镜可完全安全直接观赏，拍摄时使用三脚架中长焦镜头即可定格红月瑰丽神韵。'
    },
    {
      id: 'evt-century-eclipse-2027',
      titleEn: 'Total Solar Eclipse "Eclipse of the Century"',
      titleZh: '2027年“世纪日全食” (超长6分23秒)',
      dateStr: '2027-08-02',
      dateDisplayEn: 'Aug 2, 2027',
      dateDisplayZh: '2027年8月2日',
      relativeEn: 'Summer 2027',
      relativeZh: '2027年夏',
      rarity: 5,
      category: 'eclipse',
      targetId: 'sun',
      targetType: 'solar',
      targetNameEn: 'The Sun (Century Eclipse Path)',
      targetNameZh: '太阳 (帝王谷全食中线)',
      ra: 8.85,
      dec: 17.65,
      summaryEn: 'Nicknamed the "Eclipse of the Century"! Totality lasts an astounding 6 minutes and 23 seconds over Egypt\'s Valley of the Kings and Spain — the longest total eclipse until 2114!',
      summaryZh: '被全球天文学界誉为“世纪日全食”！全食时间长达极其震撼的 6 分 23 秒，横扫埃及卢克索帝王谷、直布罗陀海峡与西班牙，是截至2114年之前人类能在陆地上见证的最长日全食！',
      viewingTipEn: 'Plan international travel to southern Spain or Luxor, Egypt for guaranteed clear desert skies.',
      viewingTipZh: '全食带穿过西班牙南部、直布罗陀、摩洛哥及埃及卢克索，沙漠气候几乎确保无云晴空，是毕生难求的世纪天象盛典。'
    },
    {
      id: 'evt-perseids-2027',
      titleEn: 'Perseids Meteor Shower Peak',
      titleZh: '英仙座流星雨极大期',
      dateStr: '2027-08-12',
      dateDisplayEn: 'Aug 12–13, 2027',
      dateDisplayZh: '2027年8月12日–13日',
      relativeEn: 'Aug 2027',
      relativeZh: '2027年8月中旬',
      rarity: 5,
      category: 'meteor_shower',
      targetId: 'mirfak',
      targetType: 'star',
      targetNameEn: 'Perseus Radiant (near Mirfak)',
      targetNameZh: '英仙座辐射点 (天船三附近)',
      ra: 3.08,
      dec: 58.05,
      summaryEn: 'Summer’s favorite meteor shower delivers 100 fast, luminous green-and-white shooting stars per hour with persistent ionization trains from Comet Swift-Tuttle.',
      summaryZh: '盛夏最具人气的北半球流星雨！极大期每小时流量约 100 颗，流星速度快（约 59 km/s），常常拖曳出留空数秒的青白微光持久余迹。',
      viewingTipEn: 'Lie on a blanket under summer night skies after 11 PM looking toward Perseus and Cassiopeia.',
      viewingTipZh: '夏夜 23 点后仰卧于凉席或草坪上，静观仙后座与英仙座之间不断飞溅的划天流火。'
    }
  ];

  function registerSolarSystemMetadata(id, metadata) {
    if (!id || !metadata) return null;
    const key = String(id).toLowerCase();
    SOLAR_SYSTEM_METADATA[key] = { id: key, ...metadata };
    return SOLAR_SYSTEM_METADATA[key];
  }

  return {
    STARS,
    CONSTELLATIONS,
    BACKGROUND_STARS,
    MILKY_WAY_WAYPOINTS,
    SOLAR_SYSTEM_METADATA,
    registerSolarSystemMetadata,
    ISS_METADATA,
    SPACECRAFT_DATA,
    SPACECRAFT_METADATA,
    CELESTIAL_EVENTS
  };
});

