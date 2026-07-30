export const isInformationalQuestion = (prompt: string, hasGeneratedCode: boolean): boolean => {
  const p = prompt.trim().toLowerCase();
  
  // Explicit creation or modification action words
  const buildOrModifyKeywords = [
    'crée', 'cree', 'créer', 'creer', 'modifie', 'modifier', 'ajoute', 'ajouter',
    'change', 'changer', 'remplace', 'remplacer', 'fais', 'faire', 'refais', 'refaire',
    'supprime', 'supprimer', 'mets', 'mettre', 'reconstruis', 'génère', 'genere',
    'anime', 'animer', 'redesign', 'corrige', 'corriger', 'reconstruire',
    'create', 'build', 'add', 'modify', 'change', 'replace', 'make', 'update', 'delete', 'remove', 'fix'
  ];

  const hasBuildKeyword = buildOrModifyKeywords.some(kw => {
    // Match word boundary to avoid false positives
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(p);
  });

  if (hasBuildKeyword) {
    return false;
  }

  // Question indicators
  const questionWords = [
    'comment', 'pourquoi', 'qu\'est-ce', 'qu\'est ce', 'quelles', 'quels', 'quel', 'quelle',
    'combien', 'est-ce que', 'est ce que', 'expliques', 'explique', 'expliquer', 'peux-tu', 'pouvez-vous',
    'que fait', 'a quoi', 'à quoi', 'qui est', 'c\'est quoi', 'ce quoi',
    'how', 'what', 'why', 'explain', 'can you', 'where', 'who', 'which', 'tell me'
  ];

  const isQuestion = questionWords.some(qw => p.includes(qw)) || p.endsWith('?');

  if (isQuestion) {
    return true;
  }

  // If code exists and prompt is not explicitly asking to change code (e.g. conversational feedback)
  if (hasGeneratedCode && !hasBuildKeyword) {
    return true;
  }

  return false;
};
