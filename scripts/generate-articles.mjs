/**
 * 批量生成旅游攻略文章脚本
 * 为每个分类生成 20 篇（含已有的）
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const CONTENT_DIR = resolve(import.meta.dirname, '../src/content')

// ============ 元数据定义 ============
function img(prompt) {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_16_9`
}

// 现有文章（不覆盖）
const existing = new Set([
  'kyoto', 'bali', 'iceland', 'paris', 'chiang-mai',
  'dali', 'santorini', 'maldives', 'morocco', 'new-zealand',
])

// ============ 分类目标（20个/分类） ============
const destinations = {
  '亚洲': [
    { zh: '东京', en: 'Tokyo', desc: '从涩谷十字路口到浅草寺雷门，从寿司到拉面，东京是传统与未来的碰撞。', descEn: 'From Shibuya crossing to Senso-ji temple, Tokyo blends tradition and future.', tags: ['日本', '都市', '美食'], type: 'city', img: 'Tokyo Shibuya crossing neon lights night skyline Japan urban' },
    { zh: '首尔', en: 'Seoul', desc: '弘大购物、明洞美食、景福宫历史，首尔是韩流文化的中心。', descEn: 'Hongdae shopping, Myeongdong food, Gyeongbokgung history — Seoul is the heart of Korean wave.', tags: ['韩国', '购物', '韩流'], type: 'city', img: 'Seoul Gyeongbokgung palace night illuminated traditional Korean architecture' },
    { zh: '香港', en: 'Hong Kong', desc: '维多利亚港夜景、铜锣湾购物、港式早茶，东方之珠的魅力永恒。', descEn: 'Victoria Harbour skyline, Causeway Bay shopping, dim sum — Hong Kong never sleeps.', tags: ['中国', '购物', '夜景'], type: 'city', img: 'Hong Kong Victoria Harbour skyline night neon lights skyscrapers' },
    { zh: '台北', en: 'Taipei', desc: '101 大楼、士林夜市、诚品书店，台北是小清新的文艺之都。', descEn: 'Taipei 101, Shilin night market, Eslite Bookstore — a city of culture and night markets.', tags: ['台湾', '美食', '文艺'], type: 'city', img: 'Taipei 101 tower night skyline Taiwan urban' },
    { zh: '大阪', en: 'Osaka', desc: '环球影城、道顿堀美食、大阪城历史，日本第二大城市的魅力。', descEn: 'Universal Studios Japan, Dotonbori food, Osaka Castle — Japan\'s kitchen.', tags: ['日本', '美食', '历史'], type: 'food', img: 'Osaka Dotonbori night food street neon signs Japan' },
    { zh: '富士山', en: 'Mount Fuji', desc: '日本最高峰，河口湖畔樱花与富士山倒影，日本的精神象征。', descEn: 'Japan\'s highest peak, cherry blossoms and reflection at Kawaguchiko Lake.', tags: ['日本', '山岳', '樱花'], type: 'mountain', img: 'Mount Fuji Japan cherry blossom lake reflection spring' },
    { zh: '釜山', en: 'Busan', desc: '海云台海滩、甘川洞文化村、札嘎其海鲜市场，韩国第二大城。', descEn: 'Haeundae Beach, Gamcheon Culture Village, Jagalchi Fish Market — Busan\'s coastal charm.', tags: ['韩国', '海滩', '海鲜'], type: 'beach', img: 'Busan Haeundae beach summer Korea coastal city' },
    { zh: '济州岛', en: 'Jeju Island', desc: '汉拿山、泰迪熊博物馆、黑猪肉火锅，韩国的夏威夷。', descEn: 'Hallasan Mountain, Teddy Bear Museum, black pork — Korea\'s Hawaii.', tags: ['韩国', '海岛', '美食'], type: 'beach', img: 'Jeju Island Hallasan mountain tropical Korea' },
    { zh: '冲绳', en: 'Okinawa', desc: '美军基地、琉球文化、潜水胜地，日本最南端的亚热带岛屿。', descEn: 'Ryukyu culture, diving, subtropical islands — Japan\'s southernmost paradise.', tags: ['日本', '海岛', '潜水'], type: 'beach', img: 'Okinawa Japan tropical island turquoise water diving' },
    { zh: '孟买', en: 'Mumbai', desc: '宝莱坞、印度门、贫民窟与豪宅并存，印度的金融之都。', descEn: 'Bollywood, Gateway of India, India\'s financial capital of contrasts.', tags: ['印度', '都市', '文化'], type: 'city', img: 'Mumbai Gateway of India colonial architecture India' },
    { zh: '泰姬陵', en: 'Taj Mahal', desc: '世界七大奇迹，莫卧儿王朝的大理石陵墓，永恒的爱情象征。', descEn: 'One of the Seven Wonders — the marble mausoleum of eternal love.', tags: ['印度', '古迹', '世界遗产'], type: 'cultural', img: 'Taj Mahal Agra India white marble mausoleum wonder' },
    { zh: '德里', en: 'Delhi', desc: '红堡、贾马清真寺、印度门，新旧德里的历史与现代交融。', descEn: 'Red Fort, Jama Masjid, India Gate — Delhi\'s blend of old and new.', tags: ['印度', '历史', '文化'], type: 'cultural', img: 'Delhi Red Fort India Mughal architecture historic' },
    { zh: '迪拜', en: 'Dubai', desc: '哈利法塔、帆船酒店、沙漠冲沙，中东的奢华都市。', descEn: 'Burj Khalifa, Burj Al Arab, desert safari — luxury in the Arabian desert.', tags: ['阿联酋', '奢华', '沙漠'], type: 'city', img: 'Dubai Burj Khalifa skyline night UAE luxury desert' },
    { zh: '伊斯坦布尔', en: 'Istanbul', desc: '蓝色清真寺、圣索菲亚大教堂、博斯普鲁斯海峡，横跨欧亚的千年古都。', descEn: 'Blue Mosque, Hagia Sophia, Bosphorus — ancient capital spanning two continents.', tags: ['土耳其', '古迹', '宗教'], type: 'cultural', img: 'Istanbul Blue Mosque Hagia Sophia Turkey historic' },
    { zh: '加德满都', en: 'Kathmandu', desc: '杜巴广场、猴庙、烧尸庙，尼泊尔的宗教与文化中心。', descEn: 'Durbar Square, Swayambhunath, Nepal\'s spiritual heart.', tags: ['尼泊尔', '宗教', '徒步'], type: 'pilgrimage', img: 'Kathmandu Durbar Square Nepal traditional architecture' },
    { zh: '可伦坡', en: 'Colombo', desc: '独立广场、肉桂园、印度洋海滩，斯里兰卡的热带首都。', descEn: 'Independence Square, cinnamon gardens, tropical Sri Lankan capital.', tags: ['斯里兰卡', '热带', '文化'], type: 'cultural', img: 'Colombo Sri Lanka tropical Indian Ocean' },
    { zh: '赫拉特', en: 'Herat', desc: '清真寺、 bazaar 市集、丝绸之路重镇，阿富汗的历史名城。', descEn: 'Mosques, bazaars, Silk Road — Afghanistan\'s historic gem.', tags: ['阿富汗', '历史', '丝绸之路'], type: 'cultural', img: 'Herat Afghanistan mosque tiled turquoise minaret' },
    { zh: '波斯波利斯', en: 'Persepolis', desc: '阿契美尼德帝国的宫殿遗址，古波斯的辉煌见证。', descEn: 'Achaemenid palace ruins — testimony of ancient Persian glory.', tags: ['伊朗', '古迹', '世界遗产'], type: 'cultural', img: 'Persepolis Iran ancient Persian palace ruins UNESCO' },
    { zh: '佩特拉', en: 'Petra', desc: '玫瑰红砂岩城，纳巴泰人失落的城市，世界新七大奇迹。', descEn: 'Rose-red sandstone city, Nabataean wonder — New Seven Wonder of the World.', tags: ['约旦', '古迹', '沙漠'], type: 'cultural', img: 'Petra Jordan rose red sandstone canyon treasury' },
    { zh: '马尔代夫', en: 'Maldives', desc: '水上别墅、珊瑚礁、星空沙滩，印度洋的度假天堂。', descEn: 'Overwater villas, coral reefs, starry beaches — Indian Ocean paradise.', tags: ['马尔代夫', '度假', '浮潜'], type: 'beach', img: 'Maldives overwater villa turquoise lagoon tropical' },
  ],
  '东南亚': [
    { zh: '新加坡', en: 'Singapore', desc: '滨海湾花园、圣淘沙、牛车水，花园城市的多元文化。', descEn: 'Gardens by the Bay, Sentosa, Chinatown — the garden city\'s diversity.', tags: ['新加坡', '都市', '美食'], type: 'city', img: 'Singapore Gardens by the Bay night supertree illuminated' },
    { zh: '吉隆坡', en: 'Kuala Lumpur', desc: '双峰塔、黑风洞、茨厂街，马来西亚的多元首都。', descEn: 'Petronas Towers, Batu Caves, Petaling Street — Malaysia\'s melting pot.', tags: ['马来西亚', '都市', '购物'], type: 'city', img: 'Kuala Lumpur Petronas twin towers night Malaysia skyline' },
    { zh: '曼谷', en: 'Bangkok', desc: '大皇宫、卧佛寺、考山路夜市、冬阴功汤，泰国的心脏。', descEn: 'Grand Palace, Wat Pho, Khao San Road — Thailand\'s beating heart.', tags: ['泰国', '美食', '宗教'], type: 'food', img: 'Bangkok Grand Palace Wat Phra Kaew Thailand ornate' },
    { zh: '河内', en: 'Hanoi', desc: '还剑湖、三十六行街、水上木偶剧，越南的千年首都。', descEn: 'Hoan Kiem Lake, Old Quarter, water puppetry — Vietnam\'s millennial capital.', tags: ['越南', '历史', '美食'], type: 'cultural', img: 'Hanoi Hoan Kiem Lake Old Quarter Vietnam traditional' },
    { zh: '胡志明市', en: 'Ho Chi Minh City', desc: '红教堂、中央邮局、古芝地道，南越的繁华都市。', descEn: 'Notre-Dame Cathedral, Central Post Office, Cu Chi Tunnels — vibrant Saigon.', tags: ['越南', '历史', '都市'], type: 'cultural', img: 'Ho Chi Minh City Notre Dame Cathedral Vietnam colonial' },
    { zh: '吴哥窟', en: 'Angkor Wat', desc: '世界最大的宗教遗迹，高棉帝国的吴哥文明巅峰。', descEn: 'World\'s largest religious monument — peak of Khmer civilization.', tags: ['柬埔寨', '古迹', '世界遗产'], type: 'cultural', img: 'Angkor Wat Cambodia sunrise temple ruins Khmer architecture' },
    { zh: '琅勃拉邦', en: 'Luang Prabang', desc: '湄公河畔的佛教古城，夜市、布施、关西瀑布。', descEn: 'Buddhist city on Mekong, night market, alms giving, Kuang Si falls.', tags: ['老挝', '宗教', '自然'], type: 'pilgrimage', img: 'Luang Prabang Laos Mekong river Buddhist temple' },
    { zh: '万象', en: 'Vientiane', desc: '塔銮寺、湄公河日落、法式殖民建筑，老挝的首都。', descEn: 'That Luang, Mekong sunset, French colonial — Laos\'s capital.', tags: ['老挝', '宗教', '历史'], type: 'cultural', img: 'Vientiane Laos That Luang stupa Buddhist golden' },
    { zh: '仰光', en: 'Yangon', desc: '大金塔、殖民地建筑、禅意缅甸，缅甸的前首都。', descEn: 'Shwedagon Pagoda, colonial architecture — Myanmar\'s spiritual heart.', tags: ['缅甸', '宗教', '殖民'], type: 'pilgrimage', img: 'Yangon Shwedagon Pagoda Myanmar golden stupa night' },
    { zh: '马尼拉', en: 'Manila', desc: '西班牙殖民遗产、黎刹公园、海鲜美食，菲律宾的首都。', descEn: 'Spanish colonial heritage, Rizal Park, seafood — Philippines\' capital.', tags: ['菲律宾', '历史', '美食'], type: 'cultural', img: 'Manila Intramuros Philippines Spanish colonial architecture' },
    { zh: '长滩岛', en: 'Boracay', desc: '白沙滩、日落风帆、热带派对，菲律宾的度假胜地。', descEn: 'White Beach, sunset paraw sailing — Philippines\' party island.', tags: ['菲律宾', '海岛', '夜生活'], type: 'beach', img: 'Boracay White Beach Philippines sunset tropical' },
    { zh: '巴拉望', en: 'Palawan', desc: '地下河、爱妮岛、潜水天堂，菲律宾最后的处女地。', descEn: 'Underground river, El Nido diving — Philippines\' last frontier.', tags: ['菲律宾', '潜水', '自然'], type: 'nature', img: 'Palawan Philippines underground river limestone cave' },
    { zh: '龙目岛', en: 'Lombok', desc: '林贾尼火山、库塔海滩、萨萨克文化，巴厘岛的安静邻居。', descEn: 'Rinjani volcano, Kuta beach, Sasak culture — Bali\'s quieter neighbor.', tags: ['印尼', '火山', '海岛'], type: 'mountain', img: 'Lombok Rinjani volcano Indonesia tropical island' },
    { zh: '科莫多', en: 'Komodo', desc: '科莫多龙、粉色沙滩、潜水，世界自然遗产。', descEn: 'Komodo dragon, pink beach, diving — UNESCO World Heritage.', tags: ['印尼', '潜水', '世界遗产'], type: 'adventure', img: 'Komodo National Park Indonesia pink beach dragon lizard' },
    { zh: '拉贾安帕特', en: 'Raja Ampat', desc: '四王群岛，世界顶级潜水胜地，珊瑚三角区中心。', descEn: 'Four Kings — world\'s top diving, heart of the Coral Triangle.', tags: ['印尼', '潜水', '自然'], type: 'nature', img: 'Raja Ampat Indonesia diving coral reef tropical' },
    { zh: '普吉岛', en: 'Phuket', desc: '芭东海滩、普吉老城、攀牙湾，泰国最大的海岛。', descEn: 'Patong Beach, Old Phuket, Phang Nga Bay — Thailand\'s largest island.', tags: ['泰国', '海岛', '夜生活'], type: 'beach', img: 'Phuket Patong beach Thailand sunset tropical' },
    { zh: '甲米', en: 'Krabi', desc: '奥南海滩、莱利海滩、翡翠池，安达曼海的石灰石世界。', descEn: 'Ao Nang, Railay Beach, Emerald Pool — Andaman limestone karst.', tags: ['泰国', '海岛', '攀岩'], type: 'beach', img: 'Krabi Railay Beach Thailand limestone karst turquoise' },
    { zh: '苏梅岛', en: 'Koh Samui', desc: '查汶海滩、大佛寺、满月派对，泰国湾的椰子岛。', descEn: 'Chaweng Beach, Big Buddha, Full Moon Party — Gulf of Thailand coconut isle.', tags: ['泰国', '海岛', '派对'], type: 'beach', img: 'Koh Samui Thailand tropical beach coconut sunset' },
    { zh: '金边', en: 'Phnom Penh', desc: '王宫、银塔、湄公河、洞里萨湖，柬埔寨的首都。', descEn: 'Royal Palace, Silver Pagoda, Mekong — Cambodia\'s capital.', tags: ['柬埔寨', '历史', '美食'], type: 'cultural', img: 'Phnom Penh Royal Palace Cambodia Mekong river' },
    { zh: '西哈努克港', en: 'Sihanoukville', desc: 'Ochheuteal 海滩、独立海滩、热带岛屿，柬埔寨的海滨城市。', descEn: 'Ochheuteal Beach, Independence Beach — Cambodia\'s coastal city.', tags: ['柬埔寨', '海岛', '度假'], type: 'beach', img: 'Sihanoukville Cambodia tropical beach sunset' },
  ],
  '欧洲': [
    { zh: '罗马', en: 'Rome', desc: '斗兽场、梵蒂冈、特雷维喷泉，永恒之城的千年故事。', descEn: 'Colosseum, Vatican, Trevi Fountain — the Eternal City.', tags: ['意大利', '古迹', '美食'], type: 'cultural', img: 'Rome Colosseum Italy ancient ruins sunset' },
    { zh: '威尼斯', en: 'Venice', desc: '圣马可广场、大运河、贡多拉，水上之都的浪漫。', descEn: 'St. Mark\'s Square, Grand Canal, gondolas — the floating city.', tags: ['意大利', '浪漫', '历史'], type: 'cultural', img: 'Venice Grand Canal gondola Italy sunset' },
    { zh: '佛罗伦萨', en: 'Florence', desc: '乌菲兹美术馆、圣母百花大教堂，文艺复兴的摇篮。', descEn: 'Uffizi Gallery, Duomo — birthplace of the Renaissance.', tags: ['意大利', '艺术', '历史'], type: 'cultural', img: 'Florence Duomo cathedral Italy Renaissance architecture' },
    { zh: '阿姆斯特丹', en: 'Amsterdam', desc: '运河、梵高博物馆、安妮之家，北方的威尼斯。', descEn: 'Canals, Van Gogh Museum, Anne Frank — Venice of the North.', tags: ['荷兰', '艺术', '运河'], type: 'city', img: 'Amsterdam canals Netherlands golden hour bridge' },
    { zh: '巴塞罗那', en: 'Barcelona', desc: '圣家堂、桂尔公园、海鲜饭，高迪的建筑童话。', descEn: 'Sagrada Família, Park Güell, paella — Gaudí\'s architectural fairytale.', tags: ['西班牙', '建筑', '美食'], type: 'cultural', img: 'Barcelona Sagrada Familia Gaudí Spain architecture' },
    { zh: '里斯本', en: 'Lisbon', desc: '贝伦塔、热罗尼莫斯修道院、葡萄牙蛋挞，大西洋岸边的山城。', descEn: 'Belém Tower, Jerónimos Monastery, pastel de nata — Atlantic hillside city.', tags: ['葡萄牙', '历史', '美食'], type: 'cultural', img: 'Lisbon Belém Tower Portugal Tagus river' },
    { zh: '布拉格', en: 'Prague', desc: '查理大桥、布拉格城堡、天文钟，百塔之城的哥特式魅力。', descEn: 'Charles Bridge, Prague Castle, Astronomical Clock — the City of a Hundred Spires.', tags: ['捷克', '哥特', '历史'], type: 'cultural', img: 'Prague Charles Bridge Czech Republic Gothic architecture' },
    { zh: '维也纳', en: 'Vienna', desc: '圣史蒂芬大教堂、美泉宫、音乐之都的古典魅力。', descEn: 'St. Stephen\'s Cathedral, Schönbrunn — the City of Music.', tags: ['奥地利', '音乐', '历史'], type: 'cultural', img: 'Vienna St. Stephen\'s Cathedral Austria music' },
    { zh: '布达佩斯', en: 'Budapest', desc: '链子桥、渔人堡、温泉浴场，多瑙河上的双子城。', descEn: 'Chain Bridge, Fisherman\'s Bastion, thermal baths — Danube twin city.', tags: ['匈牙利', '温泉', '历史'], type: 'cultural', img: 'Budapest Chain Bridge Hungary Danube river' },
    { zh: '萨格勒布', en: 'Zagreb', desc: '大教堂、利普提拉湖、多拉克，克罗地亚的首都。', descEn: 'Cathedral, Plitvice Lakes — Croatia\'s capital.', tags: ['克罗地亚', '湖泊', '历史'], type: 'nature', img: 'Zagreb Plitvice Lakes Croatia waterfall' },
    { zh: '杜布罗夫尼克', en: 'Dubrovnik', desc: '城墙、老城、亚得里亚海，君临天下的取景地。', descEn: 'City walls, Old Town, Adriatic — King\'s Landing.', tags: ['克罗地亚', '古城', '海景'], type: 'cultural', img: 'Dubrovnik old town walls Croatia Adriatic' },
    { zh: '摩纳哥', en: 'Monaco', desc: '蒙特卡洛赌场、亲王宫、地中海游艇，世界第二小的国家。', descEn: 'Monte Carlo Casino, Prince\'s Palace — world\'s second smallest country.', tags: ['摩纳哥', '奢华', '游艇'], type: 'city', img: 'Monaco Monte Carlo casino Mediterranean luxury' },
    { zh: '瑞士阿尔卑斯', en: 'Swiss Alps', desc: '少女峰、马特洪峰、冰川快车，欧洲的脊梁。', descEn: 'Jungfrau, Matterhorn, Glacier Express — backbone of Europe.', tags: ['瑞士', '雪山', '火车'], type: 'mountain', img: 'Swiss Alps Matterhorn mountain snow' },
    { zh: '瑞士乡村', en: 'Swiss Villages', desc: '因特拉肯、卢塞恩、施皮茨，阿尔卑斯山下的童话村。', descEn: 'Interlaken, Lucerne, Spiez — fairy-tale Alpine villages.', tags: ['瑞士', '乡村', '湖泊'], type: 'mountain', img: 'Swiss village Lucerne lake Alps wooden bridge' },
    { zh: '苏格兰高地', en: 'Scottish Highlands', desc: '尼斯湖、大峡谷、苏格兰裙，英伦三岛的粗犷之美。', descEn: 'Loch Ness, Glencoe, kilts — rugged beauty of the Highlands.', tags: ['英国', '湖泊', '自然'], type: 'nature', img: 'Scottish Highlands Loch Ness misty mountains' },
    { zh: '爱尔兰乡村', en: 'Irish Countryside', desc: '莫赫悬崖、吉尼斯黑啤酒、凯尔特文化，翡翠岛。', descEn: 'Cliffs of Moher, Guinness, Celtic culture — the Emerald Isle.', tags: ['爱尔兰', '悬崖', '文化'], type: 'nature', img: 'Irish Cliffs of Moher Atlantic emerald' },
    { zh: '欧洲滑雪', en: 'European Ski', desc: '阿尔卑斯山滑雪场、雪地列车、冬季度假的极致体验。', descEn: 'Alpine ski resorts, snow trains — ultimate winter experience.', tags: ['瑞士', '滑雪', '冬季'], type: 'adventure', img: 'Swiss Alps ski resort winter snow' },
    { zh: '挪威峡湾', en: 'Norwegian Fjords', desc: '盖朗厄尔峡湾、松恩峡湾，冰河时期的自然奇迹。', descEn: 'Geirangerfjord, Sognefjord — glacial wonders.', tags: ['挪威', '峡湾', '自然'], type: 'nature', img: 'Norwegian fjord Geiranger mountain waterfall' },
    { zh: '冰岛蓝湖', en: 'Iceland Blue Lagoon', desc: '蓝湖温泉、黑沙滩、冰川徒步，冰岛的地热奇迹。', descEn: 'Blue Lagoon, black sand beach, glacier hiking — geothermal wonder.', tags: ['冰岛', '温泉', '冰川'], type: 'nature', img: 'Iceland Blue Lagoon geothermal spa' },
    { zh: '马耳他', en: 'Malta', desc: '瓦莱塔古城、巨石神庙、地中海小国，欧洲的微缩奇观。', descEn: 'Valletta, megalithic temples — Mediterranean micro-nation.', tags: ['马耳他', '古迹', '地中海'], type: 'cultural', img: 'Malta Valletta ancient walls Mediterranean' },
  ],
  '中国': [
    { zh: '丽江', en: 'Lijiang', desc: '古城、玉龙雪山、束河古镇，纳西族的丽江慢生活。', descEn: 'Old town, Jade Dragon Snow Mountain, Shuhe — Naxi slow life.', tags: ['云南', '古城', '雪山'], type: 'cultural', img: 'Lijiang Old Town Yunnan Naxi architecture canal' },
    { zh: '香格里拉', en: 'Shangri-La', desc: '普达措、松赞林寺、纳帕海草原，消失的地平线。', descEn: 'Pudacuo, Songzanlin Monastery, Napa Lake — the lost horizon.', tags: ['云南', '草原', '宗教'], type: 'nature', img: 'Shangri-La Songzanlin Monastery Yunnan Tibetan' },
    { zh: '苏州', en: 'Suzhou', desc: '拙政园、留园、平江路，江南水乡的园林之美。', descEn: 'Humble Admin\'s Garden, Pingjiang Road — Jiangnan garden beauty.', tags: ['江苏', '园林', '古镇'], type: 'cultural', img: 'Suzhou Humble Admin\'s Garden Jiangnan traditional' },
    { zh: '杭州', en: 'Hangzhou', desc: '西湖、灵隐寺、龙井茶，上有天堂下有苏杭。', descEn: 'West Lake, Lingyin Temple, Longjing tea — heaven on earth.', tags: ['浙江', '西湖', '茶文化'], type: 'cultural', img: 'Hangzhou West Lake pagoda bridge China' },
    { zh: '黄山', en: 'Huangshan', desc: '迎客松、云海、温泉，五岳归来不看山，黄山归来不看岳。', descEn: 'Welcome pine, sea of clouds, hot springs — the Yellow Mountain.', tags: ['安徽', '名山', '云海'], type: 'mountain', img: 'Huangshan China yellow mountain pine cloud' },
    { zh: '九寨沟', en: 'Jiuzhaigou', desc: '五花海、珍珠滩、诺日朗瀑布，童话世界。', descEn: 'Five-Flower Lake, Pearl Shoal, Nuorilang — fairy-tale world.', tags: ['四川', '湖泊', '自然'], type: 'nature', img: 'Jiuzhaigou China lake colorful water' },
    { zh: '西藏', en: 'Tibet', desc: '布达拉宫、纳木错、林芝桃花，世界屋脊的神圣。', descEn: 'Potala Palace, Namtso Lake — sacred Roof of the World.', tags: ['西藏', '高原', '宗教'], type: 'pilgrimage', img: 'Tibet Potala Palace Lhasa Tibetan Buddhism' },
    { zh: '新疆', en: 'Xinjiang', desc: '喀纳斯、天山天池、塔克拉玛干沙漠，西域的辽阔。', descEn: 'Kanas Lake, Tianchi, Taklamakan — vastness of the Western Regions.', tags: ['新疆', '沙漠', '湖泊'], type: 'nature', img: 'Xinjiang Kanas Lake China autumn colorful' },
    { zh: '内蒙古草原', en: 'Inner Mongolia Grassland', desc: '呼伦贝尔、额尔古纳、骑马套马，草原的辽阔自由。', descEn: 'Hulunbuir, Argun River — vast freedom of the steppe.', tags: ['内蒙古', '草原', '骑马'], type: 'nature', img: 'Inner Mongolia grassland horse sunset China' },
    { zh: '张家界', en: 'Zhangjiajie', desc: '天子山、金鞭溪、玻璃栈道，阿凡达取景地。', descEn: 'Tianzi Mountain, Golden Whip Stream — Avatar filming location.', tags: ['湖南', '山岳', '玻璃桥'], type: 'mountain', img: 'Zhangjiajie Tianzi Mountain China Avatar floating' },
    { zh: '桂林阳朔', en: 'Guilin Yangshuo', desc: '漓江、西街、十里画廊，桂林山水甲天下。', descEn: 'Li River, West Street — Guilin landscape best under heaven.', tags: ['广西', '山水', '古镇'], type: 'nature', img: 'Guilin Li River Yangshuo China karst mountain' },
    { zh: '成都', en: 'Chengdu', desc: '大熊猫、宽窄巷子、川剧变脸，巴蜀的安逸生活。', descEn: 'Pandas, Kuan Zhai Alley, Sichuan opera — Ba-Shu leisure life.', tags: ['四川', '美食', '熊猫'], type: 'food', img: 'Chengdu panda Sichuan Kuan Zhai Alley' },
    { zh: '西安', en: "Xi'an", desc: '兵马俑、大雁塔、回民街，十三朝古都的厚重。', descEn: 'Terracotta Army, Giant Wild Goose Pagoda — ancient capital.', tags: ['陕西', '古迹', '美食'], type: 'cultural', img: 'Xi\'an Terracotta Warriors ancient China' },
    { zh: '北京', en: 'Beijing', desc: '长城、故宫、胡同，千年古都的大气与市井。', descEn: 'Great Wall, Forbidden City, hutongs — grand imperial capital.', tags: ['北京', '长城', '故宫'], type: 'cultural', img: 'Beijing Great Wall Forbidden City China' },
    { zh: '上海', en: 'Shanghai', desc: '外滩、陆家嘴、石库门，东方魔都的百年风情。', descEn: 'Bund, Lujiazui, shikumen — Modu\'s century charm.', tags: ['上海', '外滩', '都市'], type: 'city', img: 'Shanghai Bund night skyline Pudong China' },
    { zh: '厦门', en: 'Xiamen', desc: '鼓浪屿、曾厝垵、土楼，海上花园的文艺气质。', descEn: 'Gulangyu, Zengcuo\'an, tulou — garden on the sea.', tags: ['福建', '海岛', '文艺'], type: 'city', img: 'Xiamen Gulangyu island Fujian China' },
    { zh: '青海', en: 'Qinghai', desc: '青海湖、茶卡盐湖、塔尔寺，青藏高原的明珠。', descEn: 'Qinghai Lake, Chaka Salt Lake — Tibetan plateau pearl.', tags: ['青海', '盐湖', '宗教'], type: 'nature', img: 'Qinghai Lake Chaka Salt Lake China mirror' },
    { zh: '海南', en: 'Hainan', desc: '三亚、亚龙湾、天涯海角，中国的热带天堂。', descEn: 'Sanya, Yalong Bay, Tianya Haijiao — China\'s tropical paradise.', tags: ['海南', '海岛', '度假'], type: 'beach', img: 'Hainan Sanya tropical beach palm China' },
    { zh: '凤凰古城', en: 'Fenghuang', desc: '沱江、吊脚楼、苗族风情，沈从文笔下的边城。', descEn: 'Tuo River, stilt houses, Miao culture — Shen Congwen\'s border town.', tags: ['湖南', '古城', '民族'], type: 'cultural', img: 'Fenghuang ancient town Tuo River Hunan' },
    { zh: '乌镇', en: 'Wuzhen', desc: '东栅西栅、蓝印花布、水乡人家，枕水人家。', descEn: 'East/West Zha, blue calico — water town living.', tags: ['浙江', '古镇', '水乡'], type: 'cultural', img: 'Wuzhen water town Jiangnan China canal' },
  ],
  '非洲': [
    { zh: '埃及', en: 'Egypt', desc: '金字塔、法老、尼罗河，人类文明的起源之一。', descEn: 'Pyramids, pharaohs, Nile — one of humanity\'s origins.', tags: ['埃及', '古迹', '沙漠'], type: 'cultural', img: 'Egypt pyramids Giza Nile ancient wonder' },
    { zh: '肯尼亚', en: 'Kenya', desc: '马赛马拉、大象、斑马大迁徙，非洲的狂野。', descEn: 'Maasai Mara, elephants, Great Migration — African wild.', tags: ['肯尼亚', '野生动物', '大迁徙'], type: 'adventure', img: 'Kenya Maasai Mara savanna elephant Africa' },
    { zh: '坦桑尼亚', en: 'Tanzania', desc: '乞力马扎罗、桑给巴尔、塞伦盖蒂，非洲之巅。', descEn: 'Kilimanjaro, Zanzibar, Serengeti — roof of Africa.', tags: ['坦桑尼亚', '雪山', '海岛'], type: 'adventure', img: 'Tanzania Kilimanjaro snow Africa highest' },
    { zh: '南非', en: 'South Africa', desc: '开普敦、好望角、克鲁格公园，彩虹之国。', descEn: 'Cape Town, Cape of Good Hope, Kruger Park — rainbow nation.', tags: ['南非', '海岸线', '野生动物'], type: 'nature', img: 'South Africa Cape Town Table Mountain Atlantic' },
    { zh: '纳米比亚', en: 'Namibia', desc: '苏丝斯黎红沙漠、鲸湾港海豹、骷髅海岸。', descEn: 'Sossusvlei red desert, Walvis Bay seals, Skeleton Coast.', tags: ['纳米比亚', '沙漠', '海豹'], type: 'adventure', img: 'Namibia Sossusvlei red desert dune' },
    { zh: '博茨瓦纳', en: 'Botswana', desc: '奥卡万戈三角洲、丘比河大象，非洲的绿洲。', descEn: 'Okavango Delta, Chobe elephants — Africa\'s oasis.', tags: ['博茨瓦纳', '三角洲', '野生动物'], type: 'nature', img: 'Botswana Okavango Delta elephant Africa' },
    { zh: '津巴布韦', en: 'Zimbabwe', desc: '维多利亚瀑布、赞比西河、大津巴布韦遗址。', descEn: 'Victoria Falls, Zambezi, Great Zimbabwe ruins.', tags: ['津巴布韦', '瀑布', '遗址'], type: 'nature', img: 'Zimbabwe Victoria Falls waterfall Africa' },
    { zh: '埃塞俄比亚', en: 'Ethiopia', desc: '拉利贝拉、阿克苏姆、咖啡发源地，非洲的摇篮。', descEn: 'Lalibela, Axum, coffee origin — cradle of Africa.', tags: ['埃塞俄比亚', '宗教', '咖啡'], type: 'pilgrimage', img: 'Ethiopia Lalibela rock-hewn church' },
    { zh: '加纳', en: 'Ghana', desc: '阿克拉、库马西、奴隶堡，西非的历史与文化。', descEn: 'Accra, Kumasi, slave forts — West African history.', tags: ['加纳', '历史', '文化'], type: 'cultural', img: 'Ghana Accra colonial architecture Africa' },
    { zh: '尼日利亚', en: 'Nigeria', desc: '拉各斯、阿布贾、尼日尔河，西非最大的国家。', descEn: 'Lagos, Abuja, Niger River — West Africa\'s largest.', tags: ['尼日利亚', '都市', '文化'], type: 'city', img: 'Nigeria Lagos skyline Africa' },
    { zh: '塞内加尔', en: 'Senegal', desc: '达喀尔、粉红湖、戈雷岛，西非的法国风情。', descEn: 'Dakar, Pink Lake, Gorée Island — West African French flair.', tags: ['塞内加尔', '粉红湖', '殖民'], type: 'cultural', img: 'Senegal Pink Lake Dakar Africa salt' },
    { zh: '马达加斯加', en: 'Madagascar', desc: '狐猴、猴面包树、热带雨林，世界第四大岛。', descEn: 'Lemurs, baobabs, rainforest — world\'s fourth largest island.', tags: ['马达加斯加', '野生动物', '雨林'], type: 'nature', img: 'Madagascar lemur baobab tree tropical' },
    { zh: '桑给巴尔', en: 'Zanzibar', desc: '石头城、香料、白沙滩，印度洋的香料岛。', descEn: 'Stone Town, spices, white sand — Indian Ocean spice island.', tags: ['坦桑尼亚', '海岛', '香料'], type: 'beach', img: 'Zanzibar Stone Town Tanzania white sand' },
    { zh: '塞舌尔', en: 'Seychelles', desc: '普拉兰岛、阿尔达布拉环礁，地球上最后的伊甸园。', descEn: 'Praslin, Aldabra Atoll — Earth\'s last Eden.', tags: ['塞舌尔', '海岛', '自然'], type: 'beach', img: 'Seychelles tropical beach boulder palm' },
    { zh: '毛里求斯', en: 'Mauritius', desc: '七色土、大湾、路易港，印度洋的甜蜜岛。', descEn: 'Colored Earth, Grand Baie, Port Louis — sweet Indian Ocean isle.', tags: ['毛里求斯', '海岛', '文化'], type: 'beach', img: 'Mauritius colored earth Chamarel tropical' },
    { zh: '莱索托', en: 'Lesotho', desc: '巴索托文化、德拉肯斯堡山脉，非洲的瑞士。', descEn: 'Basotho culture, Drakensberg — Africa\'s Switzerland.', tags: ['莱索托', '山地', '文化'], type: 'mountain', img: 'Lesotho Drakensberg mountains Africa' },
    { zh: '卢旺达', en: 'Rwanda', desc: '大猩猩、基伍湖、千丘之国，非洲的瑞士。', descEn: 'Gorillas, Lake Kivu, Land of Thousand Hills.', tags: ['卢旺达', '山地', '大猩猩'], type: 'adventure', img: 'Rwanda volcano gorilla Africa' },
    { zh: '乌干达', en: 'Uganda', desc: '金贾瀑布、伊丽莎白港、尼罗河源头。', descEn: 'Jinja Falls, Queen Elizabeth — source of the Nile.', tags: ['乌干达', '瀑布', '尼罗河'], type: 'nature', img: 'Uganda Jinja Falls Nile Africa' },
    { zh: '突尼斯', en: 'Tunisia', desc: '迦太基、斯法克斯、撒哈拉，非洲的地中海国家。', descEn: 'Carthage, Sfax, Sahara — African Mediterranean.', tags: ['突尼斯', '古迹', '沙漠'], type: 'cultural', img: 'Tunisia Carthage ancient ruins Mediterranean' },
    { zh: '马拉喀什', en: 'Marrakech', desc: '德吉玛广场、马若雷勒花园，红色之城的魅力。', descEn: 'Jemaa el-Fnaa, Majorelle Garden — red city charm.', tags: ['摩洛哥', '古城', '集市'], type: 'cultural', img: 'Marrakech Jemaa el-Fnaa Morocco souk red' },
  ],
  '大洋洲': [
    { zh: '悉尼', en: 'Sydney', desc: '歌剧院、海港大桥、邦迪海滩，澳洲最具代表性的城市。', descEn: 'Opera House, Harbour Bridge, Bondi Beach — Australia\'s iconic city.', tags: ['澳大利亚', '都市', '海滩'], type: 'city', img: 'Sydney Opera House Harbour Bridge Australia' },
    { zh: '墨尔本', en: 'Melbourne', desc: '联邦广场、大洋路、咖啡文化，澳洲的文化之都。', descEn: 'Federation Square, Great Ocean Road — Australia\'s culture capital.', tags: ['澳大利亚', '大洋路', '咖啡'], type: 'city', img: 'Melbourne Great Ocean Road Twelve Apostles' },
    { zh: '布里斯班', en: 'Brisbane', desc: '南岸公园、龙柏考拉园、摩顿岛，澳洲的阳光之都。', descEn: 'South Bank, Lone Pine Koala Sanctuary — sunny Queensland capital.', tags: ['澳大利亚', '考拉', '海滩'], type: 'city', img: 'Brisbane South Bank Australia river' },
    { zh: '珀斯', en: 'Perth', desc: '天鹅河、国王公园、弗里曼特尔，世界上最孤独的城市。', descEn: 'Swan River, Kings Park, Fremantle — world\'s loneliest city.', tags: ['澳大利亚', '海岸', '酒庄'], type: 'city', img: 'Perth Swan River Australia city skyline' },
    { zh: '阿德莱德', en: 'Adelaide', desc: '庆典中心、袋鼠岛、巴罗莎谷，南澳的葡萄酒之都。', descEn: 'Festival Centre, Kangaroo Island, Barossa Valley — SA\'s wine capital.', tags: ['澳大利亚', '酒庄', '自然'], type: 'cultural', img: 'Adelaide Barossa Valley winery Australia' },
    { zh: '塔斯马尼亚', en: 'Tasmania', desc: '摇篮山、酒杯湾、朗塞斯顿，澳洲的小岛天堂。', descEn: 'Cradle Mountain, Wineglass Bay, Launceston — island paradise.', tags: ['澳大利亚', '山地', '海滩'], type: 'nature', img: 'Tasmania Cradle Mountain Australia' },
    { zh: '乌鲁鲁', en: 'Uluru', desc: '艾尔斯岩、卡塔丘塔、星空，澳洲的心脏。', descEn: 'Ayers Rock, Kata Tjuta, starry sky — Australia\'s heart.', tags: ['澳大利亚', '红岩', '星空'], type: 'nature', img: 'Uluru Ayers Rock Australia sunset desert' },
    { zh: '大堡礁', en: 'Great Barrier Reef', desc: '凯恩斯、圣灵群岛、心形礁，世界七大自然奇观。', descEn: 'Cairns, Whitsundays, Heart Reef — natural wonder of the world.', tags: ['澳大利亚', '潜水', '珊瑚'], type: 'nature', img: 'Great Barrier Reef Australia coral diving' },
    { zh: '澳洲东海岸', en: 'East Coast', desc: '悉尼到布里斯班的海岸线，冲浪、海滩、雨林。', descEn: 'Sydney to Brisbane coast — surfing, beaches, rainforest.', tags: ['澳大利亚', '海岸', '冲浪'], type: 'beach', img: 'Australia East Coast surf beach' },
    { zh: '澳洲西海岸', en: 'West Coast', desc: '珀斯到金伯利，鲨鱼湾、宁格鲁珊瑚礁。', descEn: 'Perth to Kimberley, Shark Bay, Ningaloo Reef.', tags: ['澳大利亚', '海岸', '珊瑚'], type: 'nature', img: 'Australia West Coast Ningaloo Reef' },
    { zh: '斐济', en: 'Fiji', desc: '南太平洋岛国，珊瑚礁、部落文化、热带天堂。', descEn: 'South Pacific island — coral reefs, tribal culture, tropical paradise.', tags: ['斐济', '海岛', '潜水'], type: 'beach', img: 'Fiji tropical island coral reef Pacific' },
    { zh: '萨摩亚', en: 'Samoa', desc: '瀑布、火山、传统文化，波利尼西亚的心脏。', descEn: 'Waterfalls, volcanoes, traditional culture — Polynesia\'s heart.', tags: ['萨摩亚', '火山', '文化'], type: 'nature', img: 'Samoa tropical volcano waterfall Pacific' },
    { zh: '汤加', en: 'Tonga', desc: '座头鲸、火山岛、传统生活，南太平洋的王国。', descEn: 'Humpback whales, volcanic islands — South Pacific kingdom.', tags: ['汤加', '鲸鱼', '火山'], type: 'adventure', img: 'Tonga volcano island whale Pacific' },
    { zh: '瓦努阿图', en: 'Vanuatu', desc: '塔纳岛火山、水下邮局、丛林徒步。', descEn: 'Tanna volcano, underwater post office, jungle trekking.', tags: ['瓦努阿图', '火山', '潜水'], type: 'adventure', img: 'Vanuatu Tanna volcano Pacific island' },
    { zh: '巴布亚新几内亚', en: 'Papua New Guinea', desc: '部落文化、热带雨林、库克早期航海地。', descEn: 'Tribal culture, rainforest, early Cook voyages.', tags: ['巴布亚新几内亚', '部落', '雨林'], type: 'adventure', img: 'Papua New Guinea tribal culture rainforest' },
    { zh: '所罗门群岛', en: 'Solomon Islands', desc: '二战遗迹、潜水、部落文化，南太平洋的宝藏。', descEn: 'WWII relics, diving, tribal culture — Pacific treasure.', tags: ['所罗门群岛', '潜水', '历史'], type: 'adventure', img: 'Solomon Islands WWII wreck diving' },
    { zh: '新喀里多尼亚', en: 'New Caledonia', desc: '南方十字星、潟湖、法国风情，太平洋的法国岛。', descEn: 'Southern Cross, lagoon, French flair — Pacific France.', tags: ['新喀里多尼亚', '潟湖', '文化'], type: 'beach', img: 'New Caledonia lagoon Pacific tropical' },
    { zh: '库克群岛', en: 'Cook Islands', desc: '拉罗汤加、艾图塔基、波利尼西亚文化。', descEn: 'Rarotonga, Aitutaki, Polynesian culture.', tags: ['库克群岛', '海岛', '文化'], type: 'beach', img: 'Cook Islands Aitutaki lagoon Pacific' },
    { zh: '法属波利尼西亚', en: 'French Polynesia', desc: '塔希提、波拉波拉、大溪地珍珠，南太平洋的浪漫。', descEn: 'Tahiti, Bora Bora, pearls — South Pacific romance.', tags: ['法属波利尼西亚', '海岛', '浪漫'], type: 'beach', img: 'Bora Bora overwater bungalow lagoon' },
    { zh: '新西兰皇后镇', en: 'Queenstown NZ', desc: '蹦极、天空缆车、瓦纳卡湖，冒险之都。', descEn: 'Bungee, Skyline Gondola, Lake Wanaka — adventure capital.', tags: ['新西兰', '极限', '湖泊'], type: 'adventure', img: 'Queenstown Lake Wakatipu New Zealand' },
  ],
}

// ============ 文章内容模板 ============
const template = {
  beach: (a) => `# ${a.title}

${a.descriptionEn ? a.descriptionEn : a.description}

## 一、最佳旅行时间

${a.title}地处热带/亚热带，全年温暖。最佳旅行季通常在旱季（${a.category === '东南亚' ? '11-4 月' : '5-10 月'}），阳光充足、海水清澈。雨季午后有阵雨但价格便宜。

## 二、主要景点

### 核心海滩

当地最著名的海滩拥有细腻的白沙滩和清澈的海水，是浮潜和日光浴的绝佳场所。建议清晨早到避开人潮。

### 周边岛屿

附近小岛各具特色，可安排跳岛一日游。部分岛屿有独特的生态系统和野生动物。

### 海洋活动

- **浮潜**：珊瑚礁近距离接触海洋生物
- **皮划艇**：海上漫游，探索隐蔽海湾
- **日落巡航**：乘帆船欣赏海上日落

## 三、美食推荐

当地海鲜新鲜美味，椰子饭和热带水果是必尝。夜市和海边餐厅提供最新鲜的渔获。

## 四、交通

- 国际航班直达主要城市
- 市内交通以出租车和Grab为主
- 跳岛需参加船游团

## 五、实用贴士

1. 防晒 SPF50+，珊瑚礁友好型
2. 水母衣防珊瑚划伤
3. 浮潜不踩珊瑚
4. 尊重当地文化习俗

## 结语

${a.title}是逃离都市喧嚣的完美目的地。在这里，时间以另一种流速——潮水、阳光、星空。`,

  mountain: (a) => `# ${a.title}

${a.description}

## 一、最佳旅行时间

春秋两季（4-5 月、9-10 月）是最佳登山季节，气温适宜、视野开阔。冬季可滑雪，夏季可徒步。

## 二、徒步路线

### 入门路线

适合初学者，全程 2-3 小时，经过缓坡和森林。

### 经典路线

登顶路线，全程 6-8 小时，部分路段陡峭，需体力。

### 全景路线

绕山一周，可从多个角度欣赏山景，推荐摄影爱好者。

## 三、装备建议

- 登山鞋（必备）
- 冲锋衣（天气多变）
- 头灯（夜爬或早出发）
- 保暖层（山顶温差大）
- 饮用水（至少 2 升）

## 四、住宿

### 山下住宿

山下小镇客栈众多，价格实惠，次日一早出发登山。

### 山上住宿

部分高海拔路线有山间庇护所，需提前预订。

## 五、实用贴士

1. 高海拔地区注意高原反应
2. 天气多变，出发前查预报
3. 遵守"不留痕迹"原则
4. 携带紧急联络设备

## 结语

${a.title}不仅是一座山，更是一种修行——每一步都是对自我的挑战，每一步都有回报。`,

  city: (a) => `# ${a.title}

${a.description}

## 一、最佳旅行时间

春秋两季（4-5 月、9-10 月）气候宜人，适合户外观光。夏季炎热冬季寒冷，但各有风情。

## 二、城市漫步路线

### 历史街区

从老城中心开始，步行穿越数百年历史的街道和广场。

### 文化地标

博物馆、美术馆、历史地标集中的区域，建议安排一整天。

### 现代街区

新兴的商业区和创意园，体验当代城市活力。

## 三、美食地图

- **本地特色菜**：当地招牌美食，必尝
- **小吃街**：夜市和小吃摊，体验市井风情
- **米其林餐厅**：高端料理，适合特殊场合

## 四、交通

- 地铁/轻轨是最高效的出行方式
- 步行是探索城市最佳方式
- 打车软件覆盖主要区域

## 五、住宿建议

- 市中心：交通便利，景点步行可达
- 文创区：体验当地文化氛围
- 近郊：价格优惠，环境安静

## 结语

${a.title}是一座值得慢慢品味的城市。在这里，每一条街都有故事，每一栋建筑都有历史。`,

  cultural: (a) => `# ${a.title}

${a.description}

## 一、最佳旅行时间

春秋两季气候温和，适合户外参观。重大节庆期间有特别活动。

## 二、历史遗迹

### 核心遗址

当地最著名的历史遗迹，承载着数千年的文明记忆。

### 博物馆

藏品丰富的博物馆，是了解当地历史的最佳场所。

### 宗教场所

寺庙、教堂、清真寺等，是当地文化的精神核心。

## 三、文化体验

- **传统仪式**：参与当地传统庆典
- **手工艺**：学习当地传统技艺
- **民俗表演**：观赏传统音乐舞蹈

## 四、美食

当地传统美食源远流长，每一道菜都有历史故事。

## 五、实用贴士

1. 参观宗教场所注意着装
2. 遗迹内禁止触摸文物
3. 跟随导游了解背景故事
4. 尊重当地文化习俗

## 结语

${a.title}的魅力在于它的深度——每一处遗址都讲述着一段历史，每一种文化都值得尊重。`,

  nature: (a) => `# ${a.title}

${a.description}

## 一、最佳旅行时间

不同季节各有特色，春季花开、夏季绿浓、秋季叶黄、冬季雪白。

## 二、自然奇观

### 核心景区

当地最著名的自然景观，是摄影师的天堂。

### 野生动物栖息

珍稀动植物的栖息地，观鸟和野生动物观察的绝佳场所。

### 徒步路线

多条徒步路线穿越景区，从简单到困难各有选择。

## 三、保护措施

- 遵守"不留痕迹"原则
- 不投喂野生动物
- 不采摘植物
- 保持安静

## 四、住宿

- 景区内营地：亲近自然
- 山下小镇：舒适便利
- 生态旅馆：环保特色

## 五、实用贴士

1. 携带望远镜观察野生动物
2. 穿防水徒步鞋
3. 带足够饮用水
4. 了解当地天气变化

## 结语

${a.title}是大自然最慷慨的馈赠。在这里，你会感受到人与自然最朴素的联系。`,

  adventure: (a) => `# ${a.title}

${a.description}

## 一、最佳旅行时间

旱季（多数为 5-10 月）是最佳探险季节，天气稳定、路线清晰。

## 二、探险项目

### 徒步/登山

穿越原始地貌的徒步路线，挑战体力与意志。

### 野生动物观察

在自然栖息地观察野生动物，是此生难忘的体验。

### 极限运动

跳伞、蹦极、漂流等极限项目，释放肾上腺素。

## 三、装备清单

- 专业徒步鞋
- 防水冲锋衣
- 头灯和备用电池
- 急救包
- 卫星通讯设备

## 四、安全须知

1. 跟随专业向导
2. 告知他人行程
3. 不要单独行动
4. 了解当地危险

## 五、实用贴士

1. 提前体能训练
2. 了解当地环境
3. 携带足够补给
4. 尊重当地向导

## 结语

${a.title}是勇敢者的乐园。在这里，你将发现自己的极限，然后突破它。`,

  food: (a) => `# ${a.title}

${a.description}

## 一、最佳旅行时间

美食之旅全年皆宜。部分季节有特别美食（如秋季的松茸、冬季的火锅）。

## 二、必尝美食

### 招牌菜

当地最著名的传统菜肴，每一家老字号都有独门秘方。

### 小吃

街头小吃是当地美食的灵魂，价格亲民、味道地道。

### 甜点

当地特色甜点，是美食之旅的完美收官。

## 三、美食地图

- **老字号餐厅**：传承数十年的经典
- **夜市**：集合各种小吃
- **厨房市场**：当地食材的源头
- **烹饪课**：学习制作当地美食

## 四、文化

当地美食文化源远流长，每一道菜都有故事。

## 五、实用贴士

1. 尝试当地特色而非连锁品牌
2. 看当地人多的店
3. 勇于尝试新食材
4. 注意饮食卫生

## 结语

${a.title}的魅力藏在食物里。在这里，每一口都是文化，每一顿都是故事。`,

  pilgrimage: (a) => `# ${a.title}

${a.description}

## 一、最佳旅行时间

宗教节庆期间氛围最浓。平日游览可避开人潮，静心参拜。

## 二、宗教圣地

### 核心寺庙/教堂

当地最神圣的宗教场所，是信徒朝圣的目的地。

### 宗教仪式

有机会参与当地宗教仪式，感受精神力量。

### 周边圣地

周边还有许多小型宗教场所，各有特色。

## 三、礼仪规范

- 进入圣地脱鞋
- 穿着端庄（覆盖肩膝）
- 不大声喧哗
- 不触碰神像文物

## 四、周边体验

- 宗教艺术欣赏
- 慈善捐赠
- 与信徒交流

## 五、实用贴士

1. 尊重宗教习俗
2. 跟随当地信徒
3. 保管好随身物品
4. 了解宗教背景

## 结语

${a.title}是精神的家园。在这里，你会感受到超越物质的力量。`,
}

// ============ 生成文章 ============
let count = 0
for (const [cat, list] of Object.entries(destinations)) {
  for (const item of list) {
    // 从英文名生成 slug
    const slug = item.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (existing.has(slug)) {
      continue // 跳过已存在的
    }

    const meta = {
      slug,
      title: item.zh,
      titleEn: item.en,
      description: item.desc,
      descriptionEn: item.descEn,
      category: cat,
      categoryEn: cat, // 简化
      date: `2026-${String(Math.floor(Math.random() * 9) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      cover: img(item.img),
      tags: item.tags,
      type: item.type,
    }

    const tpl = template[item.type] || template.city
    const body = tpl(meta)
    const frontmatter = `---
title: ${meta.title}
titleEn: ${meta.titleEn}
description: ${meta.description}
descriptionEn: ${meta.descriptionEn}
category: ${meta.category}
categoryEn: ${meta.categoryEn}
date: ${meta.date}
cover: ${meta.cover}
tags:
  ${meta.tags.map(t => `- ${t}`).join('\n  ')}
---

${body}`

    const filename = `${String(count + 11).padStart(2, '0')}-${meta.slug}.md`
    writeFileSync(resolve(CONTENT_DIR, filename), frontmatter, 'utf-8')
    count++
    console.log(`  Created: ${filename} [${cat}] ${meta.title}`)
  }
}

console.log(`\nDone! Generated ${count} new articles.`)
