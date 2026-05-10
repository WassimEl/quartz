// ─────────────────────────────────────────────────────
//      liste des tags
// ─────────────────────────────────────────────────────
const TAGS = ["jeu", "jeu gratuit", "info", "rumeur", "avis", "autre"];

module.exports = async (params) => {
    const { quickAddApi } = params;
    const { vault } = app;

    // 1. set le tag
    const tag = await quickAddApi.suggester(TAGS, TAGS);
    if (!tag) return;
    const tagLabel = tag.toUpperCase();

    // 2. set le titre
    const titreSaisi = await quickAddApi.inputPrompt("📝 Titre de l'article :");
    if (!titreSaisi || titreSaisi.trim() === "") return;
    const titre = titreSaisi.trim();

    // 3. description
    const description = await quickAddApi.inputPrompt("📋 Description courte (affichée dans le flux RSS) :");
    if (!description) return;

    // 4. date
    const date = new Date().toISOString().slice(0, 10);

    // 5. Nom du fichier : "2026-05-10 - JEU GRATUIT Mon titre.md"
    const nomFichier = `${date} - ${tagLabel} ${titre}.md`;
    const cheminFichier = `posts/${nomFichier}`;

    // 6. Vérifier si le fichier existe déjà
    const fichierExistant = vault.getAbstractFileByPath(cheminFichier);
    if (fichierExistant) {
        const ecraser = await quickAddApi.yesNoPrompt("Ce fichier existe déjà. Le remplacer ?");
        if (!ecraser) return;
        await vault.delete(fichierExistant);
    }

    // 7. Contenu de la note
    const contenu = `---
title: "[${tagLabel}] ${titre}"
date: ${date}
tag: ${tag}
description: "${description}"
draft: true
---

## Résumé

> ${description}

## Contenu

`;

    // 8. Créer le fichier dans posts/
    await vault.create(cheminFichier, contenu);

    // 9. Ouvrir la note
    const nouveauFichier = vault.getAbstractFileByPath(cheminFichier);
    if (nouveauFichier) {
        await app.workspace.getLeaf(false).openFile(nouveauFichier);
    }

    new Notice(`✅ Article créé : ${nomFichier}`);
};