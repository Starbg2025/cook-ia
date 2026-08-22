export const isInformationalQuestion = (prompt: string, hasGeneratedCode: boolean): boolean => {
  const p = prompt.trim().toLowerCase();

  // Strong conversational or advisory question indicators (Should trigger ChatGPT conversation mode)
  const conversationalPrefixes = [
    'pourquoi', 'c\'est quoi', 'ce quoi', 'qui est', 'qu\'est-ce', 'qu\'est ce',
    'que penses-tu', 'que penses tu', 'tu penses quoi', 'donne ton avis',
    'explique', 'expliquer', 'expliques-moi', 'explique-moi', 'peux-tu m\'expliquer',
    'a quoi sert', 'à quoi sert', 'combien', 'quelles sont', 'quels sont', 'quel est', 'quelle est',
    'salut', 'bonjour', 'bonsoir', 'merci', 'super', 'génial', 'bravo',
    'tell me', 'explain', 'what is', 'why', 'who are you', 'how does', 'what do you think'
  ];

  const startsWithConversational = conversationalPrefixes.some(cp => p.startsWith(cp) || p.includes(` ${cp}`));
  if (startsWithConversational) {
    return true;
  }

  // Explicit creation or modification action words
  const buildOrModifyKeywords = [
    'crée', 'cree', 'créer', 'creer', 'modifie', 'modifier', 'ajoute', 'ajouter',
    'change', 'changer', 'remplace', 'remplacer', 'refais', 'refaire',
    'supprime', 'supprimer', 'mets', 'mettre', 'reconstruis', 'génère', 'genere',
    'anime', 'animer', 'redesign', 'corrige', 'corriger', 'reconstruire',
    'create', 'build', 'add', 'modify', 'change', 'replace', 'update', 'delete', 'remove', 'fix'
  ];

  const hasBuildKeyword = buildOrModifyKeywords.some(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(p);
  });

  // Pure question without explicit coding command
  const isQuestion = p.endsWith('?') || p.includes('comment ') || p.includes('est-ce que') || p.includes('est ce que');

  if (isQuestion && !hasBuildKeyword) {
    return true;
  }

  // If code exists and prompt is not explicitly asking to change code (e.g. conversational feedback)
  if (hasGeneratedCode && !hasBuildKeyword && !p.includes('fais ') && !p.includes('faire ')) {
    return true;
  }

  return false;
};
