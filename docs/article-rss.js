// scripts/article-rss.js
// Script pour créer un article RSS avec choix de tag

module.exports = async (params) => {
    const { quickAddApi } = params;
    const { vault } = app;
    
    // 1. Demander le titre (optionnel)
    let title = await quickAddApi.inputPrompt("📝 Titre de l'article (optionnel) :");
    
    // 2. Générer la date du jour au format YYYY-MM-DD
    const date = new Date().toISOString().slice(0, 10);
    
    // 3. Gérer le titre automatique si vide
    let finalTitle;
    if (!title || title.trim() === "") {
        // Chercher les fichiers commençant par "date - Untitled"
        const allFiles = vault.getMarkdownFiles();
        let maxNum = 0;
        const prefix = `${date} - Untitled`;
        
        for (const file of allFiles) {
            if (file.name.startsWith(prefix)) {
                const match = file.name.match(/Untitled(\d+)\.md$/);
                if (match) {
                    const num = parseInt(match[1]);
                    if (num > maxNum) maxNum = num;
                }
            }
        }
        
        const nextNum = maxNum + 1;
        finalTitle = `${date} - Untitled${nextNum}`;
        title = finalTitle;
    } else {
        finalTitle = `${date} - ${title}`;
    }
    
    // 4. Demander le tag (suggester avec ta liste)
    const tagOptions = ["jeu", "info", "rumeur", "avis", "autre"];
    const tag = await quickAddApi.suggester(tagOptions, tagOptions);
    if (!tag) return;
    
    // 5. Générer le tag en majuscule pour le titre
    const tagUppercase = tag.toUpperCase();
    
    // 6. Construire le contenu (pas de demande de contenu, juste un placeholder)
    const finalContent = `---
tags: [${tag}]
publish: true
date: ${date}
---

# [${tagUppercase}] ${title}

>

`;
    
    // 7. Créer le fichier à la racine du coffre
    const fileName = `${finalTitle}.md`;
    const filePath = fileName;
    
    // Vérifier si le fichier existe déjà
    const existingFile = vault.getAbstractFileByPath(filePath);
    if (existingFile) {
        const overwrite = await quickAddApi.yesNoPrompt("Ce fichier existe déjà. Le remplacer ?");
        if (!overwrite) return;
    }
    
    // Créer le fichier
    await vault.create(filePath, finalContent);
    
    // 8. Ouvrir la note
    const newFile = vault.getAbstractFileByPath(filePath);
    if (newFile) {
        await app.workspace.getLeaf(true).openFile(newFile);
    }
    
    // 9. Message de confirmation
    new Notice(`✅ Article "${fileName}" créé !`);
};