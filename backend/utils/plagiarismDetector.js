const { spawnSync } = require('child_process');
const Submission = require('../models/Submission');

const keywordsByLang = {
  javascript: new Set([
    'break', 'case', 'catch', 'class', 'continue', 'debugger', 'default', 'delete', 'do', 'else',
    'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'return',
    'super', 'switch', 'this', 'throw', 'try', 'typeof', 'void', 'while', 'with', 'yield',
    'static', 'await', 'async', 'null', 'true', 'false', 'undefined'
  ]),
  python: new Set([
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def',
    'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
    'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
  ]),
  cpp: new Set([
    'alignas', 'alignof', 'and', 'and_eq', 'asm', 'atomic_cancel', 'atomic_commit', 'atomic_noexcept',
    'bitand', 'bitor', 'break', 'case', 'catch', 'class',
    'compl', 'concept', 'const', 'consteval', 'constexpr', 'constinit', 'const_cast', 'continue', 'co_await',
    'co_return', 'co_yield', 'decltype', 'default', 'delete', 'do', 'dynamic_cast', 'else', 'enum',
    'explicit', 'export', 'extern', 'false', 'for', 'friend', 'goto', 'if', 'inline',
    'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private',
    'protected', 'public', 'reflexpr', 'register', 'reinterpret_cast', 'requires', 'return',
    'sizeof', 'static', 'static_assert', 'static_cast', 'struct', 'switch', 'template', 'this', 'thread_local',
    'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'using', 'virtual',
    'volatile', 'while', 'xor', 'xor_eq'
  ]),
  java: new Set([
    'abstract', 'assert', 'break', 'case', 'catch', 'class', 'const', 'continue',
    'default', 'do', 'else', 'enum', 'extends', 'final', 'finally', 'for', 'goto', 'if',
    'implements', 'import', 'instanceof', 'interface', 'native', 'new', 'package', 'private',
    'protected', 'public', 'return', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this',
    'throw', 'throws', 'transient', 'try', 'volatile', 'while', 'true', 'false', 'null'
  ])
};

function getPythonASTFingerprint(code) {
  const pythonScript = `
import sys
import ast

class ASTNormalizer(ast.NodeTransformer):
    def visit_Name(self, node):
        node.id = 'v'
        return node
    def visit_Constant(self, node):
        node.value = 'c'
        return node
    def visit_arg(self, node):
        node.arg = 'v'
        return node
    def visit_FunctionDef(self, node):
        node.name = 'f'
        self.generic_visit(node)
        return node
    def visit_ClassDef(self, node):
        node.name = 'C'
        self.generic_visit(node)
        return node
    def visit_Num(self, node):
        node.n = 0
        return node
    def visit_Str(self, node):
        node.s = 'c'
        return node
    def visit_NameConstant(self, node):
        node.value = 'c'
        return node

try:
    tree = ast.parse(sys.stdin.read())
    transformer = ASTNormalizer()
    normalized = transformer.visit(tree)
    print(ast.dump(normalized, annotate_fields=False, include_attributes=False))
except Exception as e:
    sys.exit(1)
`;

  try {
    const res = spawnSync('python', ['-c', pythonScript], {
      input: code,
      encoding: 'utf8',
      timeout: 2000
    });
    if (res.status === 0 && res.stdout.trim()) {
      return res.stdout.trim();
    }
  } catch (e) {
    // ignore
  }

  try {
    const res = spawnSync('python3', ['-c', pythonScript], {
      input: code,
      encoding: 'utf8',
      timeout: 2000
    });
    if (res.status === 0 && res.stdout.trim()) {
      return res.stdout.trim();
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function getRegexFingerprint(code, language) {
  let clean = code;

  // 1. Remove comments
  if (language === 'python') {
    clean = clean.replace(/#.*$/gm, '');
    clean = clean.replace(/"""[\s\S]*?"""/g, '');
    clean = clean.replace(/'''[\s\S]*?'''/g, '');
  } else {
    // js, cpp, java
    clean = clean.replace(/\/\/.*$/gm, '');
    clean = clean.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  // 2. Normalize strings and template literals
  clean = clean.replace(/"([^"\\]|\\.)*"/g, '"s"');
  clean = clean.replace(/'([^'\\]|\\.)*'/g, "'s'");
  if (language === 'javascript') {
    clean = clean.replace(/`([^`\\]|\\.)*`/g, '`s`');
  }

  // 3. Normalize numbers
  clean = clean.replace(/\b\d+(\.\d+)?\b/g, '0');

  // 4. Tokenize and normalize identifiers
  const keywords = keywordsByLang[language] || new Set();
  clean = clean.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (match) => {
    if (keywords.has(match)) {
      return match;
    }
    return 'v';
  });

  // 5. Strip all whitespace
  clean = clean.replace(/\s+/g, '');

  return clean;
}

function generateFingerprint(code, language) {
  if (!code) return '';
  if (language === 'python') {
    const astFingerprint = getPythonASTFingerprint(code);
    if (astFingerprint) {
      return 'ast:' + astFingerprint;
    }
  }
  return 'regex:' + getRegexFingerprint(code, language);
}

async function checkPlagiarism(challengeId, userId, code, language) {
  const fingerprint = generateFingerprint(code, language);
  
  // If the fingerprint is too trivial (e.g. empty or extremely small code), skip plagiarism check
  if (!fingerprint || fingerprint.length < 15) {
    return { plagiarized: false, duplicateOf: null, fingerprint };
  }

  try {
    // Find the oldest matching submission from a DIFFERENT user for the same challenge
    const duplicate = await Submission.findOne({
      challenge: challengeId,
      user: { $ne: userId },
      normalizedFingerprint: fingerprint
    }).sort({ createdAt: 1 });

    if (duplicate) {
      return {
        plagiarized: true,
        duplicateOf: duplicate._id,
        fingerprint
      };
    }
  } catch (error) {
    console.error('Error during plagiarism check:', error);
  }

  return {
    plagiarized: false,
    duplicateOf: null,
    fingerprint
  };
}

module.exports = {
  generateFingerprint,
  checkPlagiarism
};
