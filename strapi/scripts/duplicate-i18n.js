#!/usr/bin/env node
const { createStrapi } = require('@strapi/strapi');
const yargs = require('yargs/yargs');

(async () => {
    // Parse CLI
    const { from: FROM, to, type: ONLY } = yargs(process.argv.slice(2))
        .option('from', { alias: 'f', demandOption: true, type: 'string' })
        .option('to',   { alias: 't', demandOption: true, type: 'string' })
        .option('type', { alias: 'c', type: 'string' })
        .help().argv;
    const TO = to.split(',').map(s => s.trim()).filter(Boolean);

    // Use distDir for TypeScript projects
    const strapi = await createStrapi({ distDir: './dist' });
    await strapi.start();

    // Check locales exist
    const allLocales = (await strapi
        .plugin('i18n')
        .service('locales')
        .find()).map(l => l.code);
    for (const lc of [FROM, ...TO]) {
        if (!allLocales.includes(lc)) {
            console.error(`❌ Locale “${lc}” is not configured in Strapi.`);
            process.exit(1);
        }
    }

    // Find i18n-enabled collection types
    const types = Object.values(strapi.contentTypes)
        .filter(t => t.kind === 'collectionType')
        .filter(t => t.pluginOptions?.i18n?.localized)
        .filter(t => !ONLY || t.uid === ONLY);

    console.log(
        `\n▶ Duplicating ${types.length} type(s) from “${FROM}” → ${TO.join(', ')}`
    );

    for (const ct of types) {
        console.log(`\n— ${ct.uid} —`);
        const baseEntries = await strapi
            .documents(ct.uid)
            .findMany({ locale: FROM, populate: '*', fields: '*' });

        if (!baseEntries.length) {
            console.log('  No entries in source locale.');
            continue;
        }

        // Get relation fields from the content-type definition
        const relFields = Object.entries(ct.attributes)
            .filter(([k, v]) => v.type === 'relation')
            .map(([k]) => k);

        for (const entry of baseEntries) {
            const { id, documentId, createdAt, updatedAt, publishedAt, locale, ...rawData } = entry;

            // Find which locales exist for this doc
            const existingLocaleEntries = await strapi.documents(ct.uid).findMany({ where: { documentId } });
            const existingLocales = existingLocaleEntries.map(e => e.locale);

            for (const target of TO) {
                if (existingLocales.includes(target)) {
                    console.log(`  • doc ${documentId} already has ${target}`);
                    continue;
                }

                // Remove relation fields from data to be duplicated
                const data = { ...rawData };
                for (const field of relFields) {
                    delete data[field];
                }

                try {
                    await strapi.documents(ct.uid).update({
                        documentId,
                        locale: target,
                        data,
                    });
                    console.log(`  ✔ ${documentId} → ${target}`);
                } catch (err) {
                    console.error(`  ✖ ${documentId} → ${target}: ${err.message}`);
                }
            }
        }
    }

    await strapi.destroy();
    process.exit(0);
})();
