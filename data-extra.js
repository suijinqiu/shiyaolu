/* 识药录 · 扩展字段
 * 与 data.js 的 HERBS 按 id 合并：
 *   origin   道地产区（传统公认的主产/优质产区，非绝对）
 *   part     药用部位（辨识向导按此分组）
 *   usage    使用方法（煎服/外用的通用做法，不含个人剂量建议）
 *   dietary  忌口与饮食配合（传统经验，非绝对禁忌）
 * 图片不走数据字段：按约定读取 assets/herbs/<id>.jpg，缺失时显示占位说明。
 */
const HERB_EXTRA = {
  renshen: {
    origin: '吉林、辽宁（园参）；野山参主产长白山',
    part: '根',
    usage: '另煎兑服或研粉冲服；含片、炖汤亦常见。不可与藜芦同方。',
    dietary: '传统忌萝卜、浓茶（恐减药力）；服后少饮咖啡，以免失眠加重。'
  },
  huangqi: {
    origin: '山西、甘肃、内蒙古（绵黄芪为道地）',
    part: '根',
    usage: '煎服，可煮水代茶或炖汤；补气升阳多生用，补中多蜜炙。',
    dietary: '传统忌与萝卜同食；实热、感冒发热期间不宜进补。'
  },
  danggui: {
    origin: '甘肃岷县（秦归）、云南',
    part: '根',
    usage: '煎服，可炖羊肉、鸡汤；补血用归身，活血用归尾。',
    dietary: '湿盛腹胀、大便溏泄者不宜；服后忌大量生冷。'
  },
  shudihuang: {
    origin: '河南（怀地黄）、浙江',
    part: '块根',
    usage: '煎服或入丸散；质腻，常配砂仁、陈皮同用以护胃。',
    dietary: '脾虚便溏、痰多者忌；传统忌萝卜、葱白。'
  },
  baishao: {
    origin: '浙江（杭白芍）、安徽、四川',
    part: '根',
    usage: '煎服；柔肝止痛常配甘草（芍药甘草汤）。',
    dietary: '虚寒腹痛泄泻者慎；忌与藜芦同方。'
  },
  shanyao: {
    origin: '河南焦作（怀山药为道地）',
    part: '块茎',
    usage: '煎服、煮粥、蒸食；健脾止泻多炒用，生用偏于生津。',
    dietary: '湿盛中满、腹胀者少食；大便干结者不宜过量。'
  },
  gouqizi: {
    origin: '宁夏中宁（道地）、甘肃、青海',
    part: '果实',
    usage: '煎服、泡水、煮粥；每日量不宜过大。',
    dietary: '外感发热、脾虚便溏者忌；忌与温热补品叠加过量。'
  },
  dazao: {
    origin: '山东、河北、新疆',
    part: '果实',
    usage: '煎服、煮粥；常作调和药性之用。',
    dietary: '湿盛痰多、食积、齿病者慎；多食易腹胀。'
  },
  gancao: {
    origin: '内蒙古、新疆、甘肃',
    part: '根',
    usage: '煎服；调和诸药多用生甘草，补中多炙甘草。',
    dietary: '水肿、高血压者不宜久服大量；忌与海藻、大戟、芫花、甘遂同方。'
  },
  mahuang: {
    origin: '内蒙古、山西、河北',
    part: '茎',
    usage: '煎服，宜先煎去上浮沫；发汗力强，中病即止。',
    dietary: '高血压、心脏病、失眠者忌；忌与咖啡、浓茶等兴奋饮品同用。'
  },
  guizhi: {
    origin: '广西、广东',
    part: '枝',
    usage: '煎服；调和营卫常配白芍、生姜、大枣。',
    dietary: '温热病、阴虚火旺、出血者忌；服后忌生冷。'
  },
  bohe: {
    origin: '江苏、安徽、江西',
    part: '叶',
    usage: '后下（出锅前 5–10 分钟）；亦可泡茶、含漱。',
    dietary: '体虚多汗者忌；忌辛辣油腻，以免助热。'
  },
  chaihu: {
    origin: '河北、山西、陕西（北柴胡）',
    part: '根',
    usage: '煎服；和解退热多生用，疏肝多醋炙。',
    dietary: '肝阳上亢、真阴亏损者忌；忌与辛辣燥热之品同用过量。'
  },
  shengjiang: {
    origin: '山东、四川',
    part: '根茎',
    usage: '煎服或捣汁；止呕常与半夏同用，解鱼蟹毒可单用煎汤。',
    dietary: '阴虚火旺、痔疮出血者忌；不宜与酒同用过量。'
  },
  jinyinhua: {
    origin: '河南封丘、山东平邑（道地）',
    part: '花',
    usage: '煎服或泡水；清热解毒多生用，凉血止痢多炒炭。',
    dietary: '脾胃虚寒者忌；不宜长期当凉茶饮用。'
  },
  lianqiao: {
    origin: '山西、河南、陕西',
    part: '果实',
    usage: '煎服；常与金银花同用（银翘散之属）。',
    dietary: '脾胃虚寒、气虚发热者忌；忌生冷。'
  },
  banlangen: {
    origin: '河北、安徽、黑龙江',
    part: '根',
    usage: '煎服；不宜久煎、不宜长期连服。',
    dietary: '体虚无实火热毒者忌；服后忌油腻、辛辣。'
  },
  huanglian: {
    origin: '重庆石柱（味连）、四川（雅连）、湖北（云连）',
    part: '根茎',
    usage: '煎服（味极苦，常入丸散）；外用适量研末调敷。',
    dietary: '脾胃虚寒者忌；忌辛辣、油腻、酒，以免助湿热。'
  },
  huangqin: {
    origin: '山西、河北、内蒙古',
    part: '根',
    usage: '煎服；清热多生用，安胎多炒用。',
    dietary: '脾胃虚寒者忌；忌辛辣燥热之品。'
  },
  huangbo: {
    origin: '四川、贵州（川黄柏）；东北（关黄柏）',
    part: '皮',
    usage: '煎服；湿疹湿敷可煎水外洗，适量。',
    dietary: '脾胃虚寒者忌；忌辛辣、酒。'
  },
  shengdihuang: {
    origin: '河南（怀地黄为道地）',
    part: '块根',
    usage: '煎服；鲜品捣汁清热力更强。',
    dietary: '脾虚湿滞、便溏者忌；传统忌萝卜、葱白。'
  },
  dahuang: {
    origin: '甘肃、青海（西大黄）、四川',
    part: '根',
    usage: '泻下宜后下或开水泡服，久煎则泻力减弱；外用研末调敷。',
    dietary: '孕妇、哺乳期、经期、脾胃虚寒者忌；服后忌油腻；不可长期作通便药。'
  },
  mangxiao: {
    origin: '河北、天津（盐湖产区）',
    part: '矿物',
    usage: '冲服：用药汁或开水溶化后服；外用适量包敷。',
    dietary: '孕妇、脾胃虚寒者忌；服药期间忌油腻厚味；宜多饮水。'
  },
  fuzi: {
    origin: '四川江油（道地）',
    part: '根',
    usage: '必须先煎 0.5–1 小时至口尝无麻舌感，再入他药；严格遵医嘱。',
    dietary: '孕妇忌；忌酒（易加重毒性）；忌生冷；反半夏、瓜蒌、贝母、白蔹、白及。'
  },
  rougui: {
    origin: '广西、广东',
    part: '皮',
    usage: '后下或焗服，研末冲服亦可；入丸散量小。',
    dietary: '阴虚火旺、出血者忌；畏赤石脂；服后忌生冷。'
  },
  ganjiang: {
    origin: '四川、贵州',
    part: '根茎',
    usage: '煎服；回阳救逆常配附子、甘草。',
    dietary: '阴虚内热、出血者忌；忌生冷瓜果。'
  },
  banxia: {
    origin: '湖北、四川、江苏',
    part: '块茎',
    usage: '必须使用炮制品（法半夏/姜半夏/清半夏）；生品仅限外用。',
    dietary: '反川乌、草乌、附子；阴虚燥咳、血证者忌；外用后彻底洗手，勿触眼口。'
  },
  kuxingren: {
    origin: '内蒙古、辽宁、河北',
    part: '种子',
    usage: '须燀去皮尖（炮制）后捣碎入煎；不可生用过量。',
    dietary: '婴幼儿忌；不可与镇咳药叠加；一次用量务必遵医嘱。'
  },
  chenpi: {
    origin: '广东新会（道地），陈久者良',
    part: '皮',
    usage: '煎服或泡水；理气多生用，化痰多炒用。',
    dietary: '阴虚燥咳、吐血者慎；忌辛辣。'
  },
  shanzha: {
    origin: '山东、河北、河南',
    part: '果实',
    usage: '消食多炒焦煎服，活血多生用；亦可泡水。',
    dietary: '胃酸过多、胃溃疡者忌；孕妇慎；忌空腹大量食用（可致胃石）。'
  },
  maiya: {
    origin: '各地大麦产区',
    part: '果实',
    usage: '煎服；消食多炒用，回乳需大剂量并遵医嘱。',
    dietary: '哺乳期妇女忌（回乳）；忌与油腻食物同用过量。'
  },
  chuanxiong: {
    origin: '四川都江堰（道地）',
    part: '根茎',
    usage: '煎服；研末冲服亦可，量宜小。',
    dietary: '阴虚火旺、月经过多者慎；孕妇慎；忌辛辣。'
  },
  danshen: {
    origin: '四川、山东、河南',
    part: '根',
    usage: '煎服；活血多生用，安神可酒炙。',
    dietary: '孕妇慎；与华法林等抗凝药同用须评估；忌与藜芦同方。'
  },
  sanqi: {
    origin: '云南文山（道地）',
    part: '根',
    usage: '研粉冲服或吞服；外伤出血可研末外敷、加压包扎。',
    dietary: '孕妇慎；血虚无瘀者慎；**切勿与土三七（菊三七）混用**，后者含吡咯里西啶生物碱可致肝损伤。'
  },
  fuling: {
    origin: '云南、安徽、湖北',
    part: '菌核',
    usage: '煎服、煮粥；利水多生用，健脾多炒用。',
    dietary: '虚寒精滑者慎；传统忌醋。'
  },
  yiyiren: {
    origin: '贵州、福建、河北',
    part: '种子',
    usage: '煎服、煮粥；健脾止泻多炒用，清热利湿多生用。',
    dietary: '孕妇慎；津亏便结者慎；寒湿者宜炒用。'
  },
  suanzaoren: {
    origin: '河北、辽宁、河南',
    part: '种子',
    usage: '煎服；研末睡前冲服效果更集中（须遵医嘱）。',
    dietary: '有实邪郁火者慎；不宜与镇静催眠药叠加使用。'
  },
  wuweizi: {
    origin: '东北三省（北五味子）；湖北、陕西（南五味子）',
    part: '果实',
    usage: '煎服、泡水；敛肺止咳多生用，滋补多蒸熟用。',
    dietary: '表邪未解、实热者忌；咳嗽初起、麻疹初发者忌。'
  },
  baizhu: {
    origin: '浙江（于术为道地）、安徽、湖南',
    part: '根茎',
    usage: '煎服；健脾多炒用（土炒、麸炒），燥湿利水多生用。',
    dietary: '阴虚燥渴、口干者不宜；忌与耗气之品过量同用。'
  },
  maidong: {
    origin: '四川（川麦冬）、浙江（杭麦冬）',
    part: '块根',
    usage: '煎服；亦可泡水、入膏方。',
    dietary: '脾胃虚寒、便溏者忌。'
  },
  ejiao: {
    origin: '山东东阿（道地）',
    part: '动物',
    usage: '烊化（隔水炖化）后兑入药汁；入膏方或打粉冲服。',
    dietary: '脾胃虚弱者慎；服后忌浓茶；感冒期间停用。'
  },
  zhizi: {
    origin: '江西、湖南、福建',
    part: '果实',
    usage: '煎服；外用研末调敷（扭伤肿痛）。',
    dietary: '脾胃虚寒者忌；忌辛辣油腻。'
  },
  mudanpi: {
    origin: '安徽铜陵（凤丹）、四川',
    part: '皮',
    usage: '煎服；清热凉血多生用，活血多酒炙。',
    dietary: '孕妇慎；血虚有寒者忌。'
  },
  chuanbeimu: {
    origin: '四川（松贝、青贝）、西藏',
    part: '鳞茎',
    usage: '煎服或研粉冲服；不可与乌头类同方。',
    dietary: '寒痰、湿痰者不宜；忌与乌头同用。'
  },
  jiegeng: {
    origin: '安徽、河南、湖北',
    part: '根',
    usage: '煎服；利咽多用，量不宜过大（易致恶心）。',
    dietary: '阴虚咳血者忌；胃溃疡者慎。'
  },
  gualou: {
    origin: '山东、河南、河北',
    part: '果实',
    usage: '煎服；瓜蒌皮偏清热化痰，瓜蒌仁偏润肠通便。',
    dietary: '脾胃虚寒、便溏者忌；忌与乌头同用。'
  },
  muxiang: {
    origin: '云南（云木香）、四川',
    part: '根',
    usage: '煎服；行气宜后下（含挥发油）。',
    dietary: '阴虚火旺者慎；忌与滋腻之品过量同用。'
  },
  xiangfu: {
    origin: '山东、浙江、湖南',
    part: '根茎',
    usage: '煎服；醋炙增强疏肝止痛之力。',
    dietary: '阴虚血热者慎；气虚无滞者不宜久服。'
  },
  zhishi: {
    origin: '江西、四川、湖南',
    part: '果实',
    usage: '煎服；破气消积多生用，理气多炒用。',
    dietary: '脾胃虚弱者慎；孕妇慎。'
  },
  yuanzhi: {
    origin: '山西、陕西、河北',
    part: '根',
    usage: '煎服；蜜炙可减轻胃部刺激。',
    dietary: '胃炎、胃溃疡者慎；忌空腹服用。'
  },
  baiziren: {
    origin: '山东、河南、河北',
    part: '种子',
    usage: '煎服或研末冲服；打碎后入煎。',
    dietary: '便溏、痰多者慎。'
  },
  wumei: {
    origin: '四川、浙江、福建',
    part: '果实',
    usage: '煎服；亦可少量煮汤代茶。',
    dietary: '胃酸过多者慎；表邪未解者忌。'
  },
  shanzhuyu: {
    origin: '浙江临安、河南',
    part: '果实',
    usage: '煎服；固脱可用较大剂量（须遵医嘱）。',
    dietary: '湿热、小便不利者忌。'
  },
  zexie: {
    origin: '福建（建泽泻）、四川',
    part: '块茎',
    usage: '煎服；利水多生用，降脂多炒用。',
    dietary: '肾虚精滑者忌；不宜久服大量。'
  },
  cheqianzi: {
    origin: '江西、河南、黑龙江',
    part: '种子',
    usage: '布包煎（防糊锅）；亦可研末冲服。',
    dietary: '孕妇慎；肾虚滑精者忌。'
  },
  huomaren: {
    origin: '山东、河北、江苏',
    part: '果实',
    usage: '打碎煎服或研末；不可过量。',
    dietary: '孕妇慎；一次不宜大量（有中毒风险）。'
  },
  wuzhuyu: {
    origin: '贵州、广西、湖南',
    part: '果实',
    usage: '煎服；外用研末调敷（如涌泉穴）。',
    dietary: '阴虚火旺者忌；孕妇慎；不可超量。'
  },
  zisu: {
    origin: '湖北、江苏、浙江',
    part: '叶',
    usage: '后下；亦可煮水，或与鱼蟹同烹解腥解毒。',
    dietary: '气虚自汗者慎；不宜久煎。'
  },
  fangfeng: {
    origin: '黑龙江、吉林、内蒙古（关防风）',
    part: '根',
    usage: '煎服；解表多生用，止痉多炒用。',
    dietary: '阴虚血燥者忌；忌与辛辣同用过量。'
  },
  taoren: {
    origin: '山东、陕西、河北',
    part: '种子',
    usage: '打碎煎服；活血多生用，润肠多炒用。',
    dietary: '孕妇忌；不可过量（有小毒）；便溏者慎。'
  },
  honghua: {
    origin: '新疆、河南、四川',
    part: '花',
    usage: '煎服；不宜久煎。',
    dietary: '孕妇忌；出血倾向者慎。'
  },
  tianma: {
    origin: '贵州、云南、四川（道地）',
    part: '块茎',
    usage: '煎服或研粉冲服；不宜久煎。',
    dietary: '气血虚者慎；忌与辛辣同用过量。'
  },
  gouteng: {
    origin: '广西、广东、湖南',
    part: '茎',
    usage: '后下（出锅前约 10 分钟）；不宜久煎。',
    dietary: '脾胃虚寒者慎。'
  },
  aiye: {
    origin: '湖北蕲春（蕲艾）、河南',
    part: '叶',
    usage: '煎服；外用煎水熏洗，或制成艾条施灸。',
    dietary: '阴虚血热者忌；孕妇慎；不宜大量久服。'
  },
  ziwan: {
    origin: '河北、安徽、河南',
    part: '根茎',
    usage: '煎服；蜜炙可增强润肺止咳。',
    dietary: '阴虚燥咳者不宜单用；忌辛辣。'
  },
  kuandonghua: {
    origin: '河南、甘肃、山西',
    part: '花',
    usage: '煎服；蜜炙增强润肺。',
    dietary: '阴虚肺热者慎；忌辛辣。'
  },
  pipaye: {
    origin: '江苏、浙江、福建',
    part: '叶',
    usage: '刷去绒毛、布包煎；蜜炙增强润肺止咳。',
    dietary: '胃寒、风寒咳嗽者不宜。'
  },
  sangbaipi: {
    origin: '安徽、河南、浙江',
    part: '皮',
    usage: '煎服；泻肺多生用，平喘多蜜炙。',
    dietary: '肺寒咳嗽者不宜。'
  },
  tinglizi: {
    origin: '江苏、山东、安徽',
    part: '种子',
    usage: '布包煎；不宜久服。',
    dietary: '肺虚喘咳、脾虚肿满者忌。'
  },
  duhuo: {
    origin: '四川、湖北、安徽',
    part: '根',
    usage: '煎服；祛风湿多用。',
    dietary: '阴虚血燥者慎；忌与辛辣过量同用。'
  },
  weilingxian: {
    origin: '江苏、安徽、浙江',
    part: '根',
    usage: '煎服；治骨鲠可煎汤缓缓咽下。',
    dietary: '气血虚弱者慎；不宜久服。'
  },
  qinjiao: {
    origin: '甘肃、陕西、内蒙古',
    part: '根',
    usage: '煎服。',
    dietary: '脾虚便溏者慎。'
  },
  sangjisheng: {
    origin: '广西、广东、福建',
    part: '茎',
    usage: '煎服。',
    dietary: '湿热痹痛者不宜单用。'
  },
  mugua: {
    origin: '安徽、四川、湖北',
    part: '果实',
    usage: '煎服。',
    dietary: '胃酸过多者慎。'
  },
  duzhong: {
    origin: '贵州、四川、陕西',
    part: '皮',
    usage: '煎服；盐水炙增强补肾强腰。',
    dietary: '阴虚火旺者慎。'
  },
  xuduan: {
    origin: '湖北、四川、湖南',
    part: '根',
    usage: '煎服；续折伤多生用，止崩漏多炒炭。',
    dietary: '阴虚火旺者慎。'
  },
  yinyanghuo: {
    origin: '陕西、山西、湖北',
    part: '叶',
    usage: '煎服；羊脂油炙增强温肾助阳。',
    dietary: '阴虚火旺者忌。'
  },
  buguzhi: {
    origin: '河南、四川、安徽',
    part: '果实',
    usage: '煎服；外用酊剂须遵医嘱。',
    dietary: '阴虚火旺者忌；孕妇慎。'
  },
  tusizi: {
    origin: '山东、河北、山西',
    part: '种子',
    usage: '煎服；盐水炙增强补肾。',
    dietary: '阴虚火旺者慎。'
  },
  heshouwu: {
    origin: '广东、河南、湖北',
    part: '块根',
    usage: '制首乌煎服；生首乌用于解毒通便，须遵医嘱。',
    dietary: '肝功能异常者忌；忌长期大量；忌与酒同服。'
  },
  yuzhu: {
    origin: '湖南、河南、江苏',
    part: '根茎',
    usage: '煎服；亦可煮粥、煲汤。',
    dietary: '痰湿、便溏者慎。'
  },
  lianzi: {
    origin: '湖南、福建、江苏',
    part: '种子',
    usage: '煎服或煮粥。',
    dietary: '大便燥结者慎。'
  },
  qianshi: {
    origin: '江苏、湖南、安徽',
    part: '种子',
    usage: '煎服或煮粥。',
    dietary: '二便不利者慎。'
  },
  jineijin: {
    origin: '各地（家禽）',
    part: '动物',
    usage: '研末冲服效果较好；煎服需打碎。',
    dietary: '脾虚无积滞者慎。'
  },
  yinchen: {
    origin: '陕西、山西、河北',
    part: '全草',
    usage: '煎服；不宜久煎。',
    dietary: '血虚萎黄者忌。'
  },
  pugongying: {
    origin: '全国各地',
    part: '全草',
    usage: '煎服；外用鲜品捣敷。',
    dietary: '脾胃虚寒者忌。'
  },
  yuxingcao: {
    origin: '浙江、江苏、四川',
    part: '全草',
    usage: '后下；鲜品可凉拌（须辨证）。',
    dietary: '脾胃虚寒者慎；过敏体质慎。'
  },
  juemingzi: {
    origin: '安徽、广西、四川',
    part: '种子',
    usage: '煎服；亦可炒后泡水。',
    dietary: '脾虚便溏者慎；不宜长期大量。'
  },
  yimucao: {
    origin: '全国各地',
    part: '全草',
    usage: '煎服；鲜品捣敷。',
    dietary: '孕妇忌。'
  },
  niuxi: {
    origin: '河南（怀牛膝）、四川（川牛膝）',
    part: '根',
    usage: '煎服；活血多生用，补肝肾多酒炙。',
    dietary: '孕妇忌；月经过多者慎。'
  }
};

/* 辨识向导：按药用部位分组，用于逐层缩小范围 */
const PARTS = [
  { key: '根', note: '根类药材最多，断面与气味是关键' },
  { key: '根茎', note: '常有节、鳞叶痕，注意与根区分' },
  { key: '块茎', note: '块状、有芽眼，半夏即属此类（有毒）' },
  { key: '块根', note: '纺锤形或圆柱形，地黄、附子属此类' },
  { key: '茎', note: '草质茎多为细长圆柱，麻黄有"玫瑰心"' },
  { key: '枝', note: '木质枝条，桂枝皮部易剥落' },
  { key: '皮', note: '树皮类，内表面颜色与气味是重点' },
  { key: '叶', note: '含挥发油者揉之有特异香气' },
  { key: '花', note: '花蕾或初开的花，色与形是重点' },
  { key: '果实', note: '完整果实，注意表面纹理与果柄痕' },
  { key: '种子', note: '种子类注意形状、种皮与子叶' },
  { key: '菌核', note: '真菌菌核，断面粉性、嚼之粘牙' },
  { key: '矿物', note: '结晶类，注意溶解性与风化' },
  { key: '鳞茎', note: '鳞茎类，注意鳞叶抱合方式（如川贝母的"怀中抱月"）' },
  { key: '动物', note: '动物类药材（如阿胶），真伪与气味是关键' },
  { key: '全草', note: '全草类多为地上部分，茎叶形态与香气是重点' }
];
