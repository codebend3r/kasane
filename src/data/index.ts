import type {
  AniListMedia,
  MappingEntry,
  MovieEntry,
  RelationEdge,
  SeriesEntry,
  SeriesMapping,
} from "@/types";
import onePiece from "@/data/mappings/one-piece.json";
import attackOnTitan from "@/data/mappings/attack-on-titan.json";
import demonSlayer from "@/data/mappings/demon-slayer.json";
import onePunchMan from "@/data/mappings/one-punch-man.json";
import vinlandSaga from "@/data/mappings/vinland-saga.json";
import fullmetalAlchemistBrotherhood from "@/data/mappings/fullmetal-alchemist-brotherhood.json";
import hunterXHunter2011 from "@/data/mappings/hunter-x-hunter-2011.json";
import monster from "@/data/mappings/monster.json";
import jujutsuKaisen from "@/data/mappings/jujutsu-kaisen.json";
import bleachTybw from "@/data/mappings/bleach-tybw.json";
import mobPsycho100 from "@/data/mappings/mob-psycho-100.json";
import frieren from "@/data/mappings/frieren.json";
import apothecaryDiaries from "@/data/mappings/apothecary-diaries.json";
import nana from "@/data/mappings/nana.json";
import haikyuu from "@/data/mappings/haikyuu.json";
import fruitsBasket2019 from "@/data/mappings/fruits-basket-2019.json";
import berserk from "@/data/mappings/berserk.json";
import dragonBall from "@/data/mappings/dragon-ball.json";
import dragonBallZ from "@/data/mappings/dragon-ball-z.json";
import dragonBallSuper from "@/data/mappings/dragon-ball-super.json";
import wistoriaWandAndSword from "@/data/mappings/wistoria-wand-and-sword.json";
import drStone from "@/data/mappings/dr-stone.json";
import baki from "@/data/mappings/baki.json";
import bakiHanma from "@/data/mappings/baki-hanma.json";
import assassinationClassroom from "@/data/mappings/assassination-classroom.json";
import gintama from "@/data/mappings/gintama.json";
import kaguyaSama from "@/data/mappings/kaguya-sama.json";
import marchComesInLikeALion from "@/data/mappings/3-gatsu-no-lion.json";
import kingdom from "@/data/mappings/kingdom.json";
import ashitaNoJoe from "@/data/mappings/ashita-no-joe.json";
import hajimeNoIppo from "@/data/mappings/hajime-no-ippo.json";
import ikokuNikki from "@/data/mappings/ikoku-nikki.json";
import witchHatAtelier from "@/data/mappings/witch-hat-atelier.json";
import bocchiTheRock from "@/data/mappings/bocchi-the-rock.json";
import orb from "@/data/mappings/orb.json";
import mushishi from "@/data/mappings/mushishi.json";
import myHeroAcademia from "@/data/mappings/my-hero-academia.json";
import oshiNoKo from "@/data/mappings/oshi-no-ko.json";
import chainsawMan from "@/data/mappings/chainsaw-man.json";
import spyXFamily from "@/data/mappings/spy-x-family.json";
import promisedNeverland from "@/data/mappings/promised-neverland.json";
import dandadan from "@/data/mappings/dandadan.json";
import tokyoRevengers from "@/data/mappings/tokyo-revengers.json";
import madeInAbyss from "@/data/mappings/made-in-abyss.json";
import naruto from "@/data/mappings/naruto.json";
import blackClover from "@/data/mappings/black-clover.json";
import fireForce from "@/data/mappings/fire-force.json";
import soulEater from "@/data/mappings/soul-eater.json";
import noragami from "@/data/mappings/noragami.json";
import mashle from "@/data/mappings/mashle.json";
import sakamotoDays from "@/data/mappings/sakamoto-days.json";
import kaijuNo8 from "@/data/mappings/kaiju-no-8.json";
import beastars from "@/data/mappings/beastars.json";
import goldenKamuy from "@/data/mappings/golden-kamuy.json";
import bleach from "@/data/mappings/bleach.json";
import yuYuHakusho from "@/data/mappings/yu-yu-hakusho.json";
import rurouniKenshin from "@/data/mappings/rurouni-kenshin.json";
import inuyasha from "@/data/mappings/inuyasha.json";
import fairyTail from "@/data/mappings/fairy-tail.json";
import sevenDeadlySins from "@/data/mappings/seven-deadly-sins.json";
import dgrayMan from "@/data/mappings/dgray-man.json";
import magi from "@/data/mappings/magi.json";
import akameGaKill from "@/data/mappings/akame-ga-kill.json";
import yonaOfTheDawn from "@/data/mappings/yona-of-the-dawn.json";
import jojoStardustCrusaders from "@/data/mappings/jojo-stardust-crusaders.json";
import tokyoGhoul from "@/data/mappings/tokyo-ghoul.json";
import bungoStrayDogs from "@/data/mappings/bungo-stray-dogs.json";
import hellsingUltimate from "@/data/mappings/hellsing-ultimate.json";
import blackButler from "@/data/mappings/black-butler.json";
import trigun from "@/data/mappings/trigun.json";
import parasyte from "@/data/mappings/parasyte.json";
import goblinSlayer from "@/data/mappings/goblin-slayer.json";
import deathNote from "@/data/mappings/death-note.json";
import codeGeass from "@/data/mappings/code-geass.json";
import steinsGate from "@/data/mappings/steins-gate.json";
import psychoPass from "@/data/mappings/psycho-pass.json";
import neonGenesisEvangelion from "@/data/mappings/neon-genesis-evangelion.json";
import cowboyBebop from "@/data/mappings/cowboy-bebop.json";
import samuraiChamploo from "@/data/mappings/samurai-champloo.json";
import eightySix from "@/data/mappings/86-eighty-six.json";
import madokaMagica from "@/data/mappings/madoka-magica.json";
import reZero from "@/data/mappings/re-zero.json";
import mushokuTensei from "@/data/mappings/mushoku-tensei.json";
import overlord from "@/data/mappings/overlord.json";
import tensura from "@/data/mappings/tensura.json";
import shieldHero from "@/data/mappings/shield-hero.json";
import konosuba from "@/data/mappings/konosuba.json";
import noGameNoLife from "@/data/mappings/no-game-no-life.json";
import logHorizon from "@/data/mappings/log-horizon.json";
import tanyaTheEvil from "@/data/mappings/tanya-the-evil.json";
import eminenceInShadow from "@/data/mappings/eminence-in-shadow.json";
import soloLeveling from "@/data/mappings/solo-leveling.json";
import swordArtOnline from "@/data/mappings/sword-art-online.json";
import fateZero from "@/data/mappings/fate-zero.json";
import fateStayNight from "@/data/mappings/fate-stay-night.json";
import bakemonogatari from "@/data/mappings/bakemonogatari.json";
import durarara from "@/data/mappings/durarara.json";
import toaruMajutsuNoIndex from "@/data/mappings/toaru-majutsu-no-index.json";
import spiceAndWolf from "@/data/mappings/spice-and-wolf.json";
import quintessentialQuintuplets from "@/data/mappings/quintessential-quintuplets.json";
import slamDunk from "@/data/mappings/slam-dunk.json";
import cardcaptorSakura from "@/data/mappings/cardcaptor-sakura.json";
import yugiohDuelMonsters from "@/data/mappings/yugioh-duel-monsters.json";
import digimonAdventure from "@/data/mappings/digimon-adventure.json";
import blueLock from "@/data/mappings/blue-lock.json";
import kurokosBasketball from "@/data/mappings/kurokos-basketball.json";
import aceOfDiamond from "@/data/mappings/ace-of-diamond.json";
import yowamushiPedal from "@/data/mappings/yowamushi-pedal.json";
import chihayafuru from "@/data/mappings/chihayafuru.json";
import blueExorcist from "@/data/mappings/blue-exorcist.json";
import worldTrigger from "@/data/mappings/world-trigger.json";
import shamanKing2021 from "@/data/mappings/shaman-king-2021.json";
import katekyoHitmanReborn from "@/data/mappings/katekyo-hitman-reborn.json";
import toriko from "@/data/mappings/toriko.json";
import hellsParadise from "@/data/mappings/hells-paradise.json";
import undeadUnluck from "@/data/mappings/undead-unluck.json";
import beelzebub from "@/data/mappings/beelzebub.json";
import nuraRiseOfTheYokaiClan from "@/data/mappings/nura-rise-of-the-yokai-clan.json";
import toiletBoundHanakoKun from "@/data/mappings/toilet-bound-hanako-kun.json";
import fistOfTheNorthStar from "@/data/mappings/fist-of-the-north-star.json";
import saintSeiya from "@/data/mappings/saint-seiya.json";
import dororo from "@/data/mappings/dororo.json";
import claymore from "@/data/mappings/claymore.json";
import blackLagoon from "@/data/mappings/black-lagoon.json";
import dorohedoro from "@/data/mappings/dorohedoro.json";
import gantz from "@/data/mappings/gantz.json";
import ajin from "@/data/mappings/ajin.json";
import deadmanWonderland from "@/data/mappings/deadman-wonderland.json";
import btooom from "@/data/mappings/btooom.json";
import bananaFish from "@/data/mappings/banana-fish.json";
import drifters from "@/data/mappings/drifters.json";
import terraFormars from "@/data/mappings/terra-formars.json";
import knightsOfSidonia from "@/data/mappings/knights-of-sidonia.json";
import inuyashiki from "@/data/mappings/inuyashiki.json";
import horimiya from "@/data/mappings/horimiya.json";
import komiCantCommunicate from "@/data/mappings/komi-cant-communicate.json";
import myDressUpDarling from "@/data/mappings/my-dress-up-darling.json";
import nisekoi from "@/data/mappings/nisekoi.json";
import ouranHighSchoolHostClub from "@/data/mappings/ouran-high-school-host-club.json";
import yourLieInApril from "@/data/mappings/your-lie-in-april.json";
import erased from "@/data/mappings/erased.json";
import skipAndLoafer from "@/data/mappings/skip-and-loafer.json";
import bluePeriod from "@/data/mappings/blue-period.json";
import given from "@/data/mappings/given.json";
import foodWars from "@/data/mappings/food-wars.json";
import grandBlue from "@/data/mappings/grand-blue.json";
import devilIsAPartTimer from "@/data/mappings/devil-is-a-part-timer.json";
import yaBoyKongming from "@/data/mappings/ya-boy-kongming.json";
import cellsAtWork from "@/data/mappings/cells-at-work.json";
import ancientMagusBride from "@/data/mappings/ancient-magus-bride.json";
import landOfTheLustrous from "@/data/mappings/land-of-the-lustrous.json";
import rankingOfKings from "@/data/mappings/ranking-of-kings.json";
import toYourEternity from "@/data/mappings/to-your-eternity.json";
import callOfTheNight from "@/data/mappings/call-of-the-night.json";
import chivalryOfAFailedKnight from "@/data/mappings/chivalry-of-a-failed-knight.json";
import masamuneKunRevenge from "@/data/mappings/masamune-kun-revenge.json";
import nichijou from "@/data/mappings/nichijou.json";
import gachiakuta from "@/data/mappings/gachiakuta.json";
import zom100 from "@/data/mappings/zom-100.json";
import chunibyo from "@/data/mappings/chunibyo.json";
import towerOfGod from "@/data/mappings/tower-of-god.json";
import dragonMaid from "@/data/mappings/dragon-maid.json";
import seraphOfTheEnd from "@/data/mappings/seraph-of-the-end.json";
import wotakoi from "@/data/mappings/wotakoi.json";
import highSchoolDxd from "@/data/mappings/high-school-dxd.json";
import rentAGirlfriend from "@/data/mappings/rent-a-girlfriend.json";
import godOfHighSchool from "@/data/mappings/god-of-high-school.json";
import clannad from "@/data/mappings/clannad.json";
import maidSama from "@/data/mappings/maid-sama.json";
import highschoolOfTheDead from "@/data/mappings/highschool-of-the-dead.json";
import beyondTheBoundary from "@/data/mappings/beyond-the-boundary.json";
import petGirlOfSakurasou from "@/data/mappings/pet-girl-of-sakurasou.json";
import elfenLied from "@/data/mappings/elfen-lied.json";
import nagatoro from "@/data/mappings/nagatoro.json";
import bunnyGirlSenpai from "@/data/mappings/bunny-girl-senpai.json";
import toradora from "@/data/mappings/toradora.json";
import kakegurui from "@/data/mappings/kakegurui.json";
import classroomOfTheElite from "@/data/mappings/classroom-of-the-elite.json";
import futureDiary from "@/data/mappings/future-diary.json";
import danmachi from "@/data/mappings/danmachi.json";
import another from "@/data/mappings/another.json";
import oregairu from "@/data/mappings/oregairu.json";
import saikiK from "@/data/mappings/saiki-k.json";
import hyouka from "@/data/mappings/hyouka.json";
import misfitOfDemonKingAcademy from "@/data/mappings/misfit-of-demon-king-academy.json";
import goldenTime from "@/data/mappings/golden-time.json";
import myLittleMonster from "@/data/mappings/my-little-monster.json";
import irregularAtMagicHighSchool from "@/data/mappings/irregular-at-magic-high-school.json";
import relife from "@/data/mappings/relife.json";
import orange from "@/data/mappings/orange.json";
import bloodBlockadeBattlefront from "@/data/mappings/blood-blockade-battlefront.json";
import arifureta from "@/data/mappings/arifureta.json";
import nozakiKun from "@/data/mappings/nozaki-kun.json";
import deliciousInDungeon from "@/data/mappings/delicious-in-dungeon.json";
import summerTimeRendering from "@/data/mappings/summer-time-rendering.json";
import kimiNiTodoke from "@/data/mappings/kimi-ni-todoke.json";
import prisonSchool from "@/data/mappings/prison-school.json";
import dateALive from "@/data/mappings/date-a-live.json";
import aoHaruRide from "@/data/mappings/ao-haru-ride.json";
import tonikawa from "@/data/mappings/tonikawa.json";
import violetEvergarden from "@/data/mappings/violet-evergarden.json";
import devilmanCrybaby from "@/data/mappings/devilman-crybaby.json";
import kOn from "@/data/mappings/k-on.json";
import domesticGirlfriend from "@/data/mappings/domestic-girlfriend.json";
import shikimorisNotJustACutie from "@/data/mappings/shikimoris-not-just-a-cutie.json";
import heavenlyDelusion from "@/data/mappings/heavenly-delusion.json";
import caseStudyOfVanitas from "@/data/mappings/case-study-of-vanitas.json";
import shimoneta from "@/data/mappings/shimoneta.json";
import howNotToSummonADemonLord from "@/data/mappings/how-not-to-summon-a-demon-lord.json";
import haruhiSuzumiya from "@/data/mappings/haruhi-suzumiya.json";
import welcomeToTheNhk from "@/data/mappings/welcome-to-the-nhk.json";
import worldsFinestAssassin from "@/data/mappings/worlds-finest-assassin.json";
import myLoveStoryWithYamadaKun from "@/data/mappings/my-love-story-with-yamada-kun.json";
import akashicRecords from "@/data/mappings/akashic-records.json";
import cautiousHero from "@/data/mappings/cautious-hero.json";
import trinitySeven from "@/data/mappings/trinity-seven.json";
import blackBullet from "@/data/mappings/black-bullet.json";
import tsuredureChildren from "@/data/mappings/tsuredure-children.json";
import gate from "@/data/mappings/gate.json";
import fragrantFlower from "@/data/mappings/fragrant-flower.json";
import alyaSometimesHides from "@/data/mappings/alya-sometimes-hides.json";
import dailyLivesOfHighSchoolBoys from "@/data/mappings/daily-lives-of-high-school-boys.json";
import kokoroConnect from "@/data/mappings/kokoro-connect.json";
import imSakamoto from "@/data/mappings/im-sakamoto.json";
import baccano from "@/data/mappings/baccano.json";
import yamadaAndTheSevenWitches from "@/data/mappings/yamada-and-the-seven-witches.json";
import higehiro from "@/data/mappings/higehiro.json";
import eromangaSensei from "@/data/mappings/eromanga-sensei.json";
import windBreaker from "@/data/mappings/wind-breaker.json";
import blendS from "@/data/mappings/blend-s.json";
import scumsWish from "@/data/mappings/scums-wish.json";
import wiseMansGrandchild from "@/data/mappings/wise-mans-grandchild.json";
import grimgar from "@/data/mappings/grimgar.json";
import snowWhiteWithTheRedHair from "@/data/mappings/snow-white-with-the-red-hair.json";
import bofuri from "@/data/mappings/bofuri.json";
import shangriLaFrontier from "@/data/mappings/shangri-la-frontier.json";
import saekano from "@/data/mappings/saekano.json";
import greatTeacherOnizuka from "@/data/mappings/great-teacher-onizuka.json";
import gamers from "@/data/mappings/gamers.json";
import darwinsGame from "@/data/mappings/darwins-game.json";
import umaruChan from "@/data/mappings/umaru-chan.json";
import tomoChanIsAGirl from "@/data/mappings/tomo-chan-is-a-girl.json";
import monsterMusume from "@/data/mappings/monster-musume.json";
import teasingMasterTakagiSan from "@/data/mappings/teasing-master-takagi-san.json";
import tsukimichi from "@/data/mappings/tsukimichi.json";
import kamisamaKiss from "@/data/mappings/kamisama-kiss.json";
import laidBackCamp from "@/data/mappings/laid-back-camp.json";
import haganai from "@/data/mappings/haganai.json";
import irumaKun from "@/data/mappings/iruma-kun.json";
import amagiBrilliantPark from "@/data/mappings/amagi-brilliant-park.json";
import angelNextDoor from "@/data/mappings/angel-next-door.json";
import tomodachiGame from "@/data/mappings/tomodachi-game.json";
import mierukoChan from "@/data/mappings/mieruko-chan.json";
import testamentOfSisterNewDevil from "@/data/mappings/testament-of-sister-new-devil.json";
import wayOfTheHousehusband from "@/data/mappings/way-of-the-househusband.json";
import moreThanAMarriedCouple from "@/data/mappings/more-than-a-married-couple.json";
import myLoveStory from "@/data/mappings/my-love-story.json";
import asteriskWar from "@/data/mappings/asterisk-war.json";
import moriartyThePatriot from "@/data/mappings/moriarty-the-patriot.json";
import familiarOfZero from "@/data/mappings/familiar-of-zero.json";
import dangersInMyHeart from "@/data/mappings/dangers-in-my-heart.json";
import sayILoveYou from "@/data/mappings/say-i-love-you.json";
import smartphone from "@/data/mappings/smartphone.json";
import barakamon from "@/data/mappings/barakamon.json";
import watamote from "@/data/mappings/watamote.json";
import soImASpider from "@/data/mappings/so-im-a-spider.json";
import gleipnir from "@/data/mappings/gleipnir.json";
import wanderingWitch from "@/data/mappings/wandering-witch.json";
import hinamatsuri from "@/data/mappings/hinamatsuri.json";
import uzakiChan from "@/data/mappings/uzaki-chan.json";
import asobiAsobase from "@/data/mappings/asobi-asobase.json";
import redoOfHealer from "@/data/mappings/redo-of-healer.json";
import oreimo from "@/data/mappings/oreimo.json";
import villainess from "@/data/mappings/villainess.json";
import myFirstGirlfriendIsAGal from "@/data/mappings/my-first-girlfriend-is-a-gal.json";
import cheatSkill from "@/data/mappings/cheat-skill.json";
import luckyStar from "@/data/mappings/lucky-star.json";
import citrus from "@/data/mappings/citrus.json";
import netoge from "@/data/mappings/netoge.json";
import tomozaki from "@/data/mappings/tomozaki.json";
import blueBox from "@/data/mappings/blue-box.json";
import toLoveRu from "@/data/mappings/to-love-ru.json";
import bloodLad from "@/data/mappings/blood-lad.json";
import myHappyMarriage from "@/data/mappings/my-happy-marriage.json";
import plunderer from "@/data/mappings/plunderer.json";
import oresuki from "@/data/mappings/oresuki.json";
import phantomWorld from "@/data/mappings/phantom-world.json";
import killingSlimes300Years from "@/data/mappings/killing-slimes-300-years.json";
import bloomIntoYou from "@/data/mappings/bloom-into-you.json";
import realistHero from "@/data/mappings/realist-hero.json";
import gangsta from "@/data/mappings/gangsta.json";
import seireiGensouki from "@/data/mappings/seirei-gensouki.json";
import girlsLastTour from "@/data/mappings/girls-last-tour.json";
import mmoJunkie from "@/data/mappings/mmo-junkie.json";
import signOfAffection from "@/data/mappings/sign-of-affection.json";
import deathMarch from "@/data/mappings/death-march.json";
import highRiseInvasion from "@/data/mappings/high-rise-invasion.json";
import katanagatari from "@/data/mappings/katanagatari.json";
import worldGodOnlyKnows from "@/data/mappings/world-god-only-knows.json";
import recordOfRagnarok from "@/data/mappings/record-of-ragnarok.json";
import gunGaleOnlineAlternative from "@/data/mappings/gun-gale-online-alternative.json";
import aCertainScientificRailgun from "@/data/mappings/a-certain-scientific-railgun.json";
import sentencedToBeAHero from "@/data/mappings/sentenced-to-be-a-hero.json";
import theFruitOfGrisaia from "@/data/mappings/the-fruit-of-grisaia.json";
import hellsing2001 from "@/data/mappings/hellsing-2001.json";
import theSummerHikaruDied from "@/data/mappings/the-summer-hikaru-died.json";
import takopisOriginalSin from "@/data/mappings/takopis-original-sin.json";
import lovelyComplex from "@/data/mappings/lovely-complex.json";
import rokkaBravesOfTheSixFlowers from "@/data/mappings/rokka-braves-of-the-six-flowers.json";
import sankarea from "@/data/mappings/sankarea.json";
import accelWorld from "@/data/mappings/accel-world.json";
import infiniteStratos from "@/data/mappings/infinite-stratos.json";
import fateApocrypha from "@/data/mappings/fate-apocrypha.json";
import oreshura from "@/data/mappings/oreshura.json";
import uncleFromAnotherWorld from "@/data/mappings/uncle-from-another-world.json";
import girlfriendGirlfriend from "@/data/mappings/girlfriend-girlfriend.json";
import weNeverLearn from "@/data/mappings/we-never-learn.json";
import gabrielDropout from "@/data/mappings/gabriel-dropout.json";
import platinumEnd from "@/data/mappings/platinum-end.json";
import strikeTheBlood from "@/data/mappings/strike-the-blood.json";
import natsumeYuujinchou from "@/data/mappings/natsume-yuujinchou.json";
import makeineTooManyLosingHeroines from "@/data/mappings/makeine-too-many-losing-heroines.json";
import theDetectiveIsAlreadyDead from "@/data/mappings/the-detective-is-already-dead.json";
import ahoGirl from "@/data/mappings/aho-girl.json";
import hiddenDungeon from "@/data/mappings/hidden-dungeon.json";
import hundredGirlfriends from "@/data/mappings/100-girlfriends.json";
import kemonoJihen from "@/data/mappings/kemono-jihen.json";
import aharenSanWaHakarenai from "@/data/mappings/aharen-san-wa-hakarenai.json";
import tanakaKunIsAlwaysListless from "@/data/mappings/tanaka-kun-is-always-listless.json";
import howHeavyDumbbells from "@/data/mappings/how-heavy-dumbbells.json";
import rosarioVampire from "@/data/mappings/rosario-vampire.json";
import schoolLive from "@/data/mappings/school-live.json";
import pingPongTheAnimation from "@/data/mappings/ping-pong-the-animation.json";
import gosick from "@/data/mappings/gosick.json";
import twinStarExorcists from "@/data/mappings/twin-star-exorcists.json";
import banishedFromTheHerosParty from "@/data/mappings/banished-from-the-heros-party.json";
import wrongWayToUseHealingMagic from "@/data/mappings/wrong-way-to-use-healing-magic.json";
import problemChildren from "@/data/mappings/problem-children.json";
import combatantsWillBeDispatched from "@/data/mappings/combatants-will-be-dispatched.json";
import bakuman from "@/data/mappings/bakuman.json";
import konosubaExplosion from "@/data/mappings/konosuba-explosion.json";
import talentlessNana from "@/data/mappings/talentless-nana.json";
import newGame from "@/data/mappings/new-game.json";
import absoluteDuo from "@/data/mappings/absolute-duo.json";
import scienceFellInLove from "@/data/mappings/science-fell-in-love.json";

// JSON imports lose tuple types — `[1, 100]` becomes `number[]` instead of
// `[number, number]`. `normalizeMapping` rebuilds tuples literally.
type RawEntry = {
  episodes?: number[];
  chapters: number[];
  arc?: string;
  season?: number;
  note?: string;
};
type RawMovie = {
  anilistId?: number;
  title: string;
  year: number;
  chapters?: number[];
  afterEpisode?: number;
  note?: string;
};
type RawMapping = {
  anilistAnimeId: number;
  anilistMangaId: number;
  title: string;
  sourceNotes?: string;
  mappings: RawEntry[];
  movies?: RawMovie[];
};

function normalizeEntry(e: RawEntry): MappingEntry {
  if (e.chapters.length !== 2) {
    throw new Error(
      `mapping entry chapters must be a 2-tuple: ${JSON.stringify(e)}`,
    );
  }
  if (e.episodes && e.episodes.length !== 2) {
    throw new Error(
      `mapping entry episodes must be a 2-tuple: ${JSON.stringify(e)}`,
    );
  }
  return {
    chapters: [e.chapters[0], e.chapters[1]],
    episodes: e.episodes ? [e.episodes[0], e.episodes[1]] : undefined,
    arc: e.arc,
    season: e.season,
    note: e.note,
  };
}

function normalizeMovie(m: RawMovie): MovieEntry {
  if (m.chapters && m.chapters.length !== 2) {
    throw new Error(
      `movie entry chapters must be a 2-tuple: ${JSON.stringify(m)}`,
    );
  }
  return {
    anilistId: m.anilistId,
    title: m.title,
    year: m.year,
    chapters: m.chapters ? [m.chapters[0], m.chapters[1]] : undefined,
    afterEpisode: m.afterEpisode,
    note: m.note,
  };
}

function normalizeMapping(m: RawMapping): SeriesMapping {
  return {
    anilistAnimeId: m.anilistAnimeId,
    anilistMangaId: m.anilistMangaId,
    title: m.title,
    sourceNotes: m.sourceNotes,
    mappings: m.mappings.map(normalizeEntry),
    movies: m.movies?.map(normalizeMovie) ?? undefined,
  };
}

const ALL_MAPPINGS: SeriesMapping[] = [
  onePiece,
  attackOnTitan,
  demonSlayer,
  onePunchMan,
  vinlandSaga,
  fullmetalAlchemistBrotherhood,
  hunterXHunter2011,
  monster,
  jujutsuKaisen,
  bleachTybw,
  mobPsycho100,
  frieren,
  apothecaryDiaries,
  nana,
  haikyuu,
  fruitsBasket2019,
  berserk,
  dragonBall,
  dragonBallZ,
  dragonBallSuper,
  wistoriaWandAndSword,
  drStone,
  baki,
  bakiHanma,
  assassinationClassroom,
  gintama,
  kaguyaSama,
  marchComesInLikeALion,
  kingdom,
  ashitaNoJoe,
  hajimeNoIppo,
  ikokuNikki,
  witchHatAtelier,
  bocchiTheRock,
  orb,
  mushishi,
  myHeroAcademia,
  oshiNoKo,
  chainsawMan,
  spyXFamily,
  promisedNeverland,
  dandadan,
  tokyoRevengers,
  madeInAbyss,
  naruto,
  blackClover,
  fireForce,
  soulEater,
  noragami,
  mashle,
  sakamotoDays,
  kaijuNo8,
  beastars,
  goldenKamuy,
  bleach,
  yuYuHakusho,
  rurouniKenshin,
  inuyasha,
  fairyTail,
  sevenDeadlySins,
  dgrayMan,
  magi,
  akameGaKill,
  yonaOfTheDawn,
  jojoStardustCrusaders,
  tokyoGhoul,
  bungoStrayDogs,
  hellsingUltimate,
  blackButler,
  trigun,
  parasyte,
  goblinSlayer,
  deathNote,
  codeGeass,
  steinsGate,
  psychoPass,
  neonGenesisEvangelion,
  cowboyBebop,
  samuraiChamploo,
  eightySix,
  madokaMagica,
  reZero,
  mushokuTensei,
  overlord,
  tensura,
  shieldHero,
  konosuba,
  noGameNoLife,
  logHorizon,
  tanyaTheEvil,
  eminenceInShadow,
  soloLeveling,
  swordArtOnline,
  fateZero,
  fateStayNight,
  bakemonogatari,
  durarara,
  toaruMajutsuNoIndex,
  spiceAndWolf,
  quintessentialQuintuplets,
  slamDunk,
  cardcaptorSakura,
  yugiohDuelMonsters,
  digimonAdventure,
  blueLock,
  kurokosBasketball,
  aceOfDiamond,
  yowamushiPedal,
  chihayafuru,
  blueExorcist,
  worldTrigger,
  shamanKing2021,
  katekyoHitmanReborn,
  toriko,
  hellsParadise,
  undeadUnluck,
  beelzebub,
  nuraRiseOfTheYokaiClan,
  toiletBoundHanakoKun,
  fistOfTheNorthStar,
  saintSeiya,
  dororo,
  claymore,
  blackLagoon,
  dorohedoro,
  gantz,
  ajin,
  deadmanWonderland,
  btooom,
  bananaFish,
  drifters,
  terraFormars,
  knightsOfSidonia,
  inuyashiki,
  horimiya,
  komiCantCommunicate,
  myDressUpDarling,
  nisekoi,
  ouranHighSchoolHostClub,
  yourLieInApril,
  erased,
  skipAndLoafer,
  bluePeriod,
  given,
  foodWars,
  grandBlue,
  devilIsAPartTimer,
  yaBoyKongming,
  cellsAtWork,
  ancientMagusBride,
  landOfTheLustrous,
  rankingOfKings,
  toYourEternity,
  callOfTheNight,
  chivalryOfAFailedKnight,
  masamuneKunRevenge,
  nichijou,
  gachiakuta,
  zom100,
  chunibyo,
  towerOfGod,
  dragonMaid,
  seraphOfTheEnd,
  wotakoi,
  highSchoolDxd,
  rentAGirlfriend,
  godOfHighSchool,
  clannad,
  maidSama,
  highschoolOfTheDead,
  beyondTheBoundary,
  petGirlOfSakurasou,
  elfenLied,
  nagatoro,
  bunnyGirlSenpai,
  toradora,
  kakegurui,
  classroomOfTheElite,
  futureDiary,
  danmachi,
  another,
  oregairu,
  saikiK,
  hyouka,
  misfitOfDemonKingAcademy,
  goldenTime,
  myLittleMonster,
  irregularAtMagicHighSchool,
  relife,
  orange,
  bloodBlockadeBattlefront,
  arifureta,
  nozakiKun,
  deliciousInDungeon,
  summerTimeRendering,
  kimiNiTodoke,
  prisonSchool,
  dateALive,
  aoHaruRide,
  tonikawa,
  violetEvergarden,
  devilmanCrybaby,
  kOn,
  domesticGirlfriend,
  shikimorisNotJustACutie,
  heavenlyDelusion,
  caseStudyOfVanitas,
  shimoneta,
  howNotToSummonADemonLord,
  haruhiSuzumiya,
  welcomeToTheNhk,
  worldsFinestAssassin,
  myLoveStoryWithYamadaKun,
  akashicRecords,
  cautiousHero,
  trinitySeven,
  blackBullet,
  tsuredureChildren,
  gate,
  fragrantFlower,
  alyaSometimesHides,
  dailyLivesOfHighSchoolBoys,
  kokoroConnect,
  imSakamoto,
  baccano,
  yamadaAndTheSevenWitches,
  higehiro,
  eromangaSensei,
  windBreaker,
  blendS,
  scumsWish,
  wiseMansGrandchild,
  grimgar,
  snowWhiteWithTheRedHair,
  bofuri,
  shangriLaFrontier,
  saekano,
  greatTeacherOnizuka,
  gamers,
  darwinsGame,
  umaruChan,
  tomoChanIsAGirl,
  monsterMusume,
  teasingMasterTakagiSan,
  tsukimichi,
  kamisamaKiss,
  laidBackCamp,
  haganai,
  irumaKun,
  amagiBrilliantPark,
  angelNextDoor,
  tomodachiGame,
  mierukoChan,
  testamentOfSisterNewDevil,
  wayOfTheHousehusband,
  moreThanAMarriedCouple,
  myLoveStory,
  asteriskWar,
  moriartyThePatriot,
  familiarOfZero,
  dangersInMyHeart,
  sayILoveYou,
  smartphone,
  barakamon,
  watamote,
  soImASpider,
  gleipnir,
  wanderingWitch,
  hinamatsuri,
  uzakiChan,
  asobiAsobase,
  redoOfHealer,
  oreimo,
  villainess,
  myFirstGirlfriendIsAGal,
  cheatSkill,
  luckyStar,
  citrus,
  netoge,
  tomozaki,
  blueBox,
  toLoveRu,
  bloodLad,
  myHappyMarriage,
  plunderer,
  oresuki,
  phantomWorld,
  killingSlimes300Years,
  bloomIntoYou,
  realistHero,
  gangsta,
  seireiGensouki,
  girlsLastTour,
  mmoJunkie,
  signOfAffection,
  deathMarch,
  highRiseInvasion,
  katanagatari,
  worldGodOnlyKnows,
  recordOfRagnarok,
  gunGaleOnlineAlternative,
  aCertainScientificRailgun,
  sentencedToBeAHero,
  theFruitOfGrisaia,
  hellsing2001,
  theSummerHikaruDied,
  takopisOriginalSin,
  lovelyComplex,
  rokkaBravesOfTheSixFlowers,
  sankarea,
  accelWorld,
  infiniteStratos,
  fateApocrypha,
  oreshura,
  uncleFromAnotherWorld,
  girlfriendGirlfriend,
  weNeverLearn,
  gabrielDropout,
  platinumEnd,
  strikeTheBlood,
  natsumeYuujinchou,
  makeineTooManyLosingHeroines,
  theDetectiveIsAlreadyDead,
  ahoGirl,
  hiddenDungeon,
  hundredGirlfriends,
  kemonoJihen,
  aharenSanWaHakarenai,
  tanakaKunIsAlwaysListless,
  howHeavyDumbbells,
  rosarioVampire,
  schoolLive,
  pingPongTheAnimation,
  gosick,
  twinStarExorcists,
  banishedFromTheHerosParty,
  wrongWayToUseHealingMagic,
  problemChildren,
  combatantsWillBeDispatched,
  bakuman,
  konosubaExplosion,
  talentlessNana,
  newGame,
  absoluteDuo,
  scienceFellInLove,
].map(normalizeMapping);

export function findMappingByMediaId(mediaId: number): SeriesMapping | null {
  return (
    ALL_MAPPINGS.find(
      (m) => m.anilistAnimeId === mediaId || m.anilistMangaId === mediaId,
    ) ?? null
  );
}

export function episodeToChapters(
  mapping: SeriesMapping,
  episode: number,
): [number, number] | null {
  const hit = mapping.mappings.find(
    (m) => !!m.episodes && episode >= m.episodes[0] && episode <= m.episodes[1],
  );
  return hit ? hit.chapters : null;
}

export function chapterToEpisodes(
  mapping: SeriesMapping,
  chapter: number,
): [number, number] | null {
  const hit = mapping.mappings.find(
    (m) => chapter >= m.chapters[0] && chapter <= m.chapters[1],
  );
  return hit?.episodes ?? null;
}

export { ALL_MAPPINGS };

function findRelatedId(
  edges: RelationEdge[],
  relationType: "SOURCE" | "ADAPTATION",
  nodeType: "ANIME" | "MANGA",
): number | null {
  const hit = edges.find(
    (e) => e.relationType === relationType && e.node.type === nodeType,
  );
  return hit?.node.id ?? null;
}

export function pairResults(media: AniListMedia[]): SeriesEntry[] {
  const byId = new Map<number, AniListMedia>(
    media.map((m): [number, AniListMedia] => [m.id, m]),
  );

  const absorbed = new Set(
    media
      .filter((m) => m.type === "ANIME")
      .map((m) => findRelatedId(m.relations?.edges ?? [], "SOURCE", "MANGA"))
      .filter((id): id is number => id !== null && byId.has(id)),
  );

  const entries = media
    .filter((m) => !absorbed.has(m.id))
    .map((m): SeriesEntry => {
      if (m.type === "MANGA") {
        const adapterId = findRelatedId(
          m.relations?.edges ?? [],
          "ADAPTATION",
          "ANIME",
        );
        const anime = adapterId ? (byId.get(adapterId) ?? null) : null;
        return {
          routeId: m.id,
          primary: m,
          manga: m,
          anime,
          badge: adapterId ? "both" : "manga-only",
        };
      }
      const sourceMangaId = findRelatedId(
        m.relations?.edges ?? [],
        "SOURCE",
        "MANGA",
      );
      const manga = sourceMangaId ? (byId.get(sourceMangaId) ?? null) : null;
      return {
        routeId: sourceMangaId ?? m.id,
        primary: manga ?? m,
        manga,
        anime: m,
        badge: sourceMangaId ? "both" : "anime-only",
      };
    });

  // Multiple anime adapting the same source manga (e.g. Mob Psycho 100 S1/II/III)
  // all collapse to the same routeId — keep the first (highest SEARCH_MATCH).
  return Array.from(
    entries
      .reduce((acc, e) => {
        if (!acc.has(e.routeId)) acc.set(e.routeId, e);
        return acc;
      }, new Map<number, SeriesEntry>())
      .values(),
  );
}

const PARTNER_RELATION_TYPES = new Set(["ADAPTATION", "SOURCE"]);

export function buildSyntheticMapping(
  media: AniListMedia,
): SeriesMapping | null {
  if (!media.relations) return null;

  const partnerType = media.type === "ANIME" ? "MANGA" : "ANIME";

  const candidates = media.relations.edges
    .filter((e) => PARTNER_RELATION_TYPES.has(e.relationType))
    .filter((e) => e.node.type === partnerType)
    .filter((e) =>
      partnerType === "ANIME" ? !!e.node.episodes : !!e.node.chapters,
    );

  if (candidates.length === 0) return null;

  candidates.sort(
    (a, b) =>
      (a.node.startDate?.year ?? 9999) - (b.node.startDate?.year ?? 9999),
  );
  const partner = candidates[0].node;

  const anime = media.type === "ANIME" ? media : partner;
  const manga = media.type === "MANGA" ? media : partner;

  const episodes = anime.episodes ?? null;
  const chapters = manga.chapters ?? null;
  if (!episodes || !chapters) return null;

  return {
    anilistAnimeId: anime.id,
    anilistMangaId: manga.id,
    title: media.title.english ?? media.title.romaji ?? "Series",
    sourceNotes:
      "Auto-estimated linear mapping — anime episode count distributed evenly across the manga chapter count. Real arc pacing is rarely uniform; submit a curated JSON for accuracy.",
    mappings: [
      {
        episodes: [1, episodes],
        chapters: [1, chapters],
        arc: "Full series (auto)",
      },
    ],
  };
}
