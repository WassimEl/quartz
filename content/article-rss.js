// ─────────────────────────────────────────────────────
//  TAGS DISPONIBLES — modifie cette liste librement
// ─────────────────────────────────────────────────────
const TAGS = ["jeu", "jeu gratuit", "info", "rumeur", "avis", "autre"];

// ─────────────────────────────────────────────────────
//  SCRIPT
// ─────────────────────────────────────────────────────
module.exports = async (params) => {
    const { quickAddApi } = params;
    const { vault } = app;

    // 1. Choisir le tag en premier
    const tag = await quickAddApi.suggester(TAGS, TAGS);
    if (!tag) return;

    const tagLabel = tag.toUpperCase();

    // 2. Demander le titre
    const titreSaisi = await quickAddApi.inputPrompt("📝 Titre de l'article (laisser vide = Untitled) :");

    // 3. Date du jour
    const date = new Date().toISOString().slice(0, 10);

    // 4. Gérer le titre final
    let titre;
    if (!titreSaisi || titreSaisi.trim() === "") {
        const allFiles = vault.getMarkdownFiles();
        let maxNum = 0;
        for (const file of allFiles) {
            const regex = new RegExp(`^${date} - ${tagLabel} Untitled(\\d+)\\.md$`);
            const match = file.name.match(regex);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxNum) maxNum = num;
            }
        }
        titre = `Untitled${maxNum + 1}`;
    } else {
        titre = titreSaisi.trim();
    }

    // 5. Nom du fichier : "2026-05-09 - INFO Mon titre.md"
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
description: ""
draft: true
---

>

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