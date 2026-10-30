package com.ai.assistance.operit.data.announcement

import java.util.Locale

/**
 * Локальные переводы удалённых объявлений.
 *
 * Сервер отдаёт объявления только в `zh-CN`, поэтому в ru/en интерфейсе показывался китайский
 * текст. Таблица привязана к исходному тексту объявления: если сервер изменит формулировку,
 * совпадения не будет и объявление покажется в том виде, в котором пришло — устаревший перевод
 * не подменяет актуальный текст.
 */
internal object RemoteAnnouncementTranslations {

    private data class Entry(
        val zhTitle: String,
        val zhBody: String,
        val translations: Map<String, AnnouncementLocaleContent>
    )

    private val entries: List<Entry> =
            listOf(
                    Entry(
                            zhTitle = "公告",
                            zhBody =
                                    "今日，我们发现部分商家在第三方渠道售卖低劣插件，更有甚者直接将软件已有功能包装为付费项目进行虚假宣传，或倒卖插件市场中的免费插件，骗取用户钱财。\n\n在此明确一点：Operit 及插件市场内的所有免费插件都是审核人员审核过，均可直接使用，无需向任何人付费。第三方插件未经官方审核，信息安全无法保障，任何在第三方渠道出现的收费售卖，均非官方行为，请大家擦亮眼睛，谨慎购买。",
                            translations =
                                    mapOf(
                                            "ru" to
                                                    AnnouncementLocaleContent(
                                                            title = "Объявление",
                                                            body =
                                                                    "Сегодня мы выяснили, что часть продавцов предлагает низкокачественные плагины через сторонние каналы. Некоторые идут дальше: выдают уже существующие функции приложения за платные услуги с ложной рекламой или перепродают бесплатные плагины из маркета, обманывая пользователей.\n\nУточняем: Operit и все бесплатные плагины маркета проверены рецензентами и доступны сразу — платить за них никому не нужно. Сторонние плагины не проходят официальную проверку, их информационная безопасность не гарантируется, а любая платная продажа через сторонние каналы не является официальной. Будьте внимательны и покупайте осмотрительно.",
                                                            acknowledge = "Понятно"
                                                    ),
                                            "en" to
                                                    AnnouncementLocaleContent(
                                                            title = "Announcement",
                                                            body =
                                                                    "Today we found that some sellers offer low-quality plugins through third-party channels. Some go further: they repackage features the app already has as paid services with misleading advertising, or resell free plugins from the plugin market to defraud users.\n\nTo be clear: Operit and every free plugin in the plugin market have been reviewed by our reviewers and can be used right away — nobody needs to pay for them. Third-party plugins are not officially reviewed, their security cannot be guaranteed, and any paid sale through third-party channels is not an official act. Please stay alert and buy cautiously.",
                                                            acknowledge = "I Understand"
                                                    )
                                    )
                    )
            )

    /**
     * Перевод для [language] (`ru`/`en`), если исходный zh-текст объявления совпадает с тем, с
     * которого сделан перевод.
     */
    fun find(zhContent: AnnouncementLocaleContent?, language: String): AnnouncementLocaleContent? {
        val source = zhContent ?: return null
        val lang = language.lowercase(Locale.US)
        val entry =
                entries.firstOrNull { it.zhTitle == source.title && it.zhBody == source.body }
                        ?: return null
        return entry.translations[lang]
    }
}
