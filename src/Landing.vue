<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'reka-ui'
import UiButton from './shared/UiButton.vue'
import DemoEmbed from './DemoEmbed.vue'
import { landingAssets } from './landing-assets'
import { leadErrors } from './landing-model'
const asset = (node: string, name: string) => landingAssets[`${node}-${name}` as keyof typeof landingAssets]
const form = ref({ name: '', phone: '', email: '', consent: false, terms: false })
const attempted = ref(false), submitting = ref(false), submitted = ref(false), documentTitle = ref('')
const errors = computed(() => attempted.value ? leadErrors(form.value) : {})
const formElement = ref<HTMLFormElement>()
const legendColors = ['#068638','#82cb05','#cbe200','#fdea33','#fdb00d','#f3790a','#cc0000']
const legendWidths = [4.079,8.159,14.957,22.436,19.037,19.037,4.079]
const offerBars = [
  { name:'imgFrame2087330814',left:62.79,top:6.61 },{ name:'imgFrame2087330993',left:124,top:-83 },
  { name:'imgFrame2087330994',left:186.53,top:-16.1 },{ name:'imgFrame2087330997',left:375.09,top:0 },
  { name:'imgFrame2087330995',left:250,top:0 },{ name:'imgFrame2087330999',left:0,top:0 },
  { name:'imgFrame2087330996',left:312.3,top:0 },{ name:'imgFrame2087330998',left:437.88,top:0 },
]
async function submit() {
  if (submitting.value) return
  attempted.value = true
  if (Object.keys(errors.value).length) { await nextTick(); formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(); return }
  submitting.value = true
  // shortcut: the landing is a frontend prototype; connect the approved request API separately.
  await new Promise(resolve => setTimeout(resolve, 350))
  submitted.value = true; submitting.value = false
  await nextTick(); document.getElementById('request-result')?.focus()
}
function reopen() { submitted.value = false; void nextTick(() => document.getElementById('lead-name')?.focus()) }
</script>

<template>
  <div class="l-page">
    <a href="#live-demo" class="l-skip">Перейти к интерактивному демо</a>
    <header class="l-header">
      <a class="l-brand" href="#top" aria-label="Умный сев — начало страницы"><span class="l-brand-name"><span class="l-brand-symbol"><img src="/assets/sidebar-imgGroup9.svg" alt="" width="24" height="24" /></span><span>Умный сев</span></span><span class="l-brand-divider"><img :src="asset('22100:47382','imgLine283')" alt="" /></span><span class="l-tagline">Цифровое зрение<br />для эксперта</span></a>
      <nav class="l-nav" aria-label="Разделы лендинга"><a href="#how-it-works">Как это работает</a><a href="#how-to-start">Как начать</a><a href="#contacts">Контакты</a></nav>
      <div class="l-header-actions"><a class="l-phone" href="tel:89999999999"><img :src="asset('22100:47382','imgLocalPhone')" alt="" />8 999 999 99 99</a><a class="l-header-cta l-button" href="#request">Попробовать бесплатно</a></div>
    </header>

    <main>
      <section id="top" class="l-hero" aria-labelledby="hero-title">
        <div class="l-hero-photo"><img :src="asset('22119:48838','imgRectangle')" alt="Посевной комплекс в поле" fetchpriority="high" /></div>
        <h1 id="hero-title">Превратите данные о посеве<br />в гарантию высокого урожая</h1>
        <div class="l-benefits">
          <div class="l-benefit l-benefit-experience"><div class="l-stream"><img :src="asset('22119:48838','imgStream')" alt="" /></div><p>Объедините опыт вашей команды с точной аналитикой в реальном времени</p></div>
          <div class="l-benefit l-benefit-speed"><img :src="asset('22119:48838','imgBolt')" alt="" /><p>Пресекайте нарушения технологий в первую минуту</p></div>
          <div class="l-benefit l-benefit-insights"><img :src="asset('22119:48838','imgInsights')" alt="" /><p>Исключайте пропуски и управляйте урожайностью каждого гектара</p></div>
        </div>
        <a class="l-button l-hero-cta" href="#request">Заказать демо<img :src="asset('22119:48838','imgKeyboardArrowDown')" alt="" /></a>
        <div class="l-hero-area" aria-label="Пример показателей обработанной площади"><strong>Обработанная площадь, га</strong><div class="l-area-bar"><span /><img :src="asset('22119:48838','imgFrame2087330590')" alt="" /></div><div class="l-area-stats"><div><p><span class="l-red">2.10</span> / 10%</p><small><i class="l-red-dot" />С нарушениями</small></div><div><p><span class="l-green">22.90</span> / 100%</p><small><i class="l-green-dot" />Засеяно</small></div><div><p>66.90</p><small><i />Общая площадь</small></div></div></div>
        <div class="l-hero-alerts" aria-label="Пример нарушений"><div><img :src="asset('22119:48838','imgVector')" alt="" /><span>При забитии сошников</span><span>0.01 га</span><span class="l-faded">/</span><span class="l-faded">1.0%</span></div><div><i /><span>Не обработано</span><span>0.32 га</span><span class="l-faded">/</span><span class="l-faded">0.2%</span></div></div>
        <div class="l-legend" aria-label="Легенда карты высева"><div class="l-legend-labels"><span v-for="value in ['36,000','36,100','35,000','34,000','33,000','36,0']" :key="value">{{ value }}</span></div><div class="l-legend-scale"><span v-for="color in legendColors" :key="color" :style="{background:color}" /></div><div class="l-legend-histogram"><span v-for="(width,index) in legendWidths" :key="index" :style="{width:`${width}px`}" /></div></div>
      </section>

      <section id="how-it-works" class="l-demo-section l-section" aria-labelledby="demo-title">
        <div class="l-demo-heading"><span class="l-badge">У вас под умным контролем</span><h2 id="demo-title">Единый стандарт визуализации</h2><p>Аппаратная часть поддерживает работу с популярными системами контроля высева и легко адаптируется под протокол вашей сеялки.</p></div>
        <div id="live-demo" class="l-live-demo" tabindex="-1"><DemoEmbed /></div>
      </section>

      <section class="l-metrics l-section" aria-label="Возможности мониторинга">
        <article class="l-metric l-metric-map"><div class="l-metric-copy"><img :src="asset('22086:47204','imgFrame2087331090')" alt="" /><h2>Цифровое зрение в реальном времени</h2><p>Система мгновенно визуализирует процесс сева на карте. Вы увидите пропуски и нарушения в режиме онлайн.</p></div><div class="l-map-crop"><img :src="asset('22086:47204','img21')" alt="Карта проходов сеялки с выделенными зонами нарушений" /></div></article>
        <article class="l-metric l-metric-numbers"><div class="l-metric-copy"><img :src="asset('22086:47204','imgFrame2087331090')" alt="" /><h2>Объективный контроль качества сева в цифрах</h2><p>Система автоматически рассчитывает ключевые метрики: общую посеянную площадь, процент и гектары нарушений, зоны пропусков для каждого поля</p></div><div class="l-numbers-crop"><img :src="asset('22086:47204','img31')" alt="Список полей: засеянная площадь, нарушения и прогресс работ" /></div></article>
      </section>

      <section class="l-reports l-section" aria-labelledby="reports-title"><img class="l-reports-image" :src="asset('22086:46479','imgFrame2087331184')" alt="Пример отчёта о работе сеялок" /><div class="l-reports-copy"><img :src="asset('22086:46479','imgFrame2087331091')" alt="" /><h2 id="reports-title">Отчеты за 1 клик</h2><p>Система формирует детальные отчеты по каждому полю, агрегату и механизатору</p></div><div class="l-report-decor l-report-decor-a"><img :src="asset('22086:46479','imgFrame2087331094')" alt="" /></div><div class="l-report-decor l-report-decor-b"><img :src="asset('22086:46479','imgFrame2087331095')" alt="" /></div></section>

      <div class="l-between-badge"><span class="l-badge">У вас под умным контролем</span></div>
      <section class="l-capabilities l-section" aria-label="Контроль и работа с событиями">
        <article class="l-capability l-capability-alerts"><div class="l-capability-copy"><img :src="asset('22114:47547','imgFrame2087331090')" alt="" /><h2>Оперативное уведомление о критических событиях</h2><p>Система автоматически уведомляет ответственное лицо при обнаружении поломок, технологических нарушений и незапланированных простоев. Вы узнаете о проблеме сразу вы устраните причину и возобновите работу, минимизируя потери времени и ресурсов.</p></div><div class="l-alerts-visual"><img class="l-alerts-screen" :src="asset('22114:47547','img')" alt="Мониторинг сеялок с уведомлениями о нарушениях" /><div class="l-alert-progress"><div class="l-alert-progress-bar"><span /><span /></div><p><span>60.0</span><span>/</span><span>60%</span><span>100.00</span></p></div><div class="l-alert-card"><img :src="asset('22114:47547','imgSpeakerNotesOff')" alt="" /><div><strong>Норма сева</strong><span>10 мин назад</span></div></div></div></article>
        <article class="l-capability l-capability-seeds"><div class="l-capability-copy"><img :src="asset('22114:47547','imgFrame2087331091')" alt="" /><h2>Мониторинг расхода семян</h2><p>Сколько семян потрачено на каждое поле, карта плотности сева, уведомление в случае повышения расхода выше установленной нормы семян - это всё будет доступно скоро.</p></div><img class="l-seeds-image" :src="asset('22114:47547','imgFrame2087330963')" alt="Карта плотности сева и значения нормы высева" /></article>
        <article class="l-capability l-capability-incidents"><div class="l-capability-copy"><img :src="asset('22114:47547','imgFrame2087331091')" alt="" /><h2>Единое пространство для разбора полетов</h2><p>Удобный встроенный механизм работы с инцидентами позволит диспетчеру оставлять комментарии к каждой тревоге и фиксировать статус решения прямо в интерфейсе сервиса.</p></div><img class="l-incidents-image" :src="asset('22114:47547','imgFrame2087330962')" alt="Карточка тревоги с параметрами и действием обработки" /></article>
      </section>

      <section id="how-to-start" class="l-offers-and-request l-section" aria-label="Предложение и демо-доступ">
        <div class="l-offers"><div class="l-offer-heading"><span class="l-badge">Предложение</span></div><div class="l-offer-cards">
          <article class="l-offer-card l-offer-integrators"><div class="l-offer-glow"><div><img :src="asset('22086:47208','imgEllipse302')" alt="" /></div></div><div class="l-offer-square l-offer-square-a"><img :src="asset('22086:47208','imgFrame2087331094')" alt="" /></div><div class="l-offer-square l-offer-square-b"><img :src="asset('22086:47208','imgFrame2087331095')" alt="" /></div><h2>Для интеграторов</h2><p>Покажем возможности системы, расскажем о вашей выгоде и обучим команду</p></article>
          <article class="l-offer-card l-offer-clients"><div class="l-offer-glow"><div><img :src="asset('22086:47208','imgEllipse302')" alt="" /></div></div><div class="l-offer-square l-offer-square-c"><img :src="asset('22086:47208','imgFrame2087331096')" alt="" /></div><div class="l-offer-square l-offer-square-d"><img :src="asset('22086:47208','imgFrame2087331097')" alt="" /></div><h2>Для клиентов</h2><p>Продемонстрируем возможности системы. Рассчитаем ROI до старта. Поможем на каждом этапе внедрения</p></article>
          <article class="l-offer-card l-offer-makers"><div class="l-offer-bars"><img v-for="bar in offerBars" :key="bar.name" :src="asset('22086:47208',bar.name)" :style="{left:`${bar.left}px`,top:`${bar.top}px`}" alt="" /></div><h2>Для производителей техники</h2><p>Предложим вам единую визуализацию и настроим систему под ваши требования.</p></article>
        </div><div class="l-offer-connectors" aria-hidden="true"><img :src="asset('22086:47208','imgVector359')" alt="" /><img :src="asset('22086:47208','imgVector360')" alt="" /><img :src="asset('22086:47208','imgVector361')" alt="" /></div></div>

        <section id="request" class="l-request" aria-labelledby="request-title"><div class="l-request-copy"><h2 id="request-title">Оставьте заявку<br />на демо-доступ</h2><h3>На демо вы узнаете</h3><ul><li>Как выглядят зоны с нарушением технологии</li><li>Какой процент поля засеяно</li><li>Сколько было пропусков и перекрытий</li></ul></div>
          <form ref="formElement" class="l-lead-form" novalidate @submit.prevent="submit">
            <template v-if="!submitted"><div class="l-lead-field"><label for="lead-name">Имя</label><input id="lead-name" v-model="form.name" name="name" autocomplete="name" maxlength="100" :disabled="submitting" /></div><div class="l-lead-field"><label for="lead-phone">Телефон*</label><input id="lead-phone" v-model="form.phone" name="phone" type="tel" autocomplete="tel" maxlength="30" required :aria-invalid="!!errors.phone || undefined" :aria-describedby="errors.phone ? 'lead-phone-error' : undefined" :disabled="submitting" /><p v-if="errors.phone" id="lead-phone-error" class="l-form-error">{{ errors.phone }}</p></div><div class="l-lead-field"><label for="lead-email">E-mail*</label><input id="lead-email" v-model="form.email" name="email" type="email" autocomplete="email" maxlength="254" required :aria-invalid="!!errors.email || undefined" :aria-describedby="errors.email ? 'lead-email-error' : undefined" :disabled="submitting" /><p v-if="errors.email" id="lead-email-error" class="l-form-error">{{ errors.email }}</p></div><div class="l-consents"><label><input v-model="form.consent" type="checkbox" required :disabled="submitting" :aria-invalid="!!errors.consent || undefined" /><span>Я даю согласие на обработку и передачу персональных данных</span></label><label><input v-model="form.terms" type="checkbox" required :disabled="submitting" :aria-invalid="!!errors.terms || undefined" /><span>Ознакомлен с пользовательским соглашением и с политикой конфиденциальности</span></label><p v-if="errors.consent || errors.terms" class="l-form-error" role="alert">{{ errors.consent || errors.terms }}</p></div><UiButton class="l-submit" type="submit" :loading="submitting">Оставить заявку</UiButton></template>
            <div v-else id="request-result" class="l-request-result" role="status" tabindex="-1"><img src="/assets/sidebar-imgGroup9.svg" width="24" height="24" alt="" /><h3>Форма заполнена</h3><p>Это демонстрационная версия. Ваши данные никуда не отправлены.</p><UiButton class="l-submit" variant="secondary" @click="reopen">Вернуться к форме</UiButton></div>
          </form>
        </section>
      </section>
    </main>

    <footer id="contacts" class="l-footer l-section"><div class="l-footer-rule" /><div class="l-footer-columns"><div><h2>Контакты</h2><p>ООО «ТехноКом»<br />г. Челябинск, ул. Бр. Кашириных, 65</p><a href="tel:+79194003828">+7 919 400 38 28</a></div><div><h2>Отдел продаж</h2><a href="mailto:sales@agagro.ru">sales@agagro.ru</a><p>Стоимость решения «Умный сев»<br />рассчитывается по запросу</p></div><div><h2>Техническая поддержка</h2><a href="mailto:support@agsev.ru">support@agsev.ru</a></div><div><h2>Новости, анонсы, решения</h2><img :src="asset('22100:47409','img')" alt="Telegram, MAX, ВКонтакте" /></div></div><div class="l-footer-legal"><p>© 2026 Все права защищены</p><div><button type="button" @click="documentTitle = 'Согласие на обработку персональных данных'">Согласие на обработку персональных данных</button><button type="button" @click="documentTitle = 'Политика конфиденциальности'">Политика конфиденциальности</button></div></div></footer>
    <DialogRoot :open="!!documentTitle" @update:open="!$event && (documentTitle = '')"><DialogPortal><DialogOverlay class="l-dialog-overlay" /><DialogContent class="l-document-dialog"><DialogTitle>{{ documentTitle }}</DialogTitle><DialogDescription>Для получения документов свяжитесь с отделом продаж: <a href="mailto:sales@agagro.ru">sales@agagro.ru</a>.</DialogDescription><DialogClose as-child><UiButton class="l-submit" variant="secondary">Закрыть</UiButton></DialogClose></DialogContent></DialogPortal></DialogRoot>
  </div>
</template>
