import type { ESLint, Rule } from 'eslint';

interface CommentNode {
    value: string;
    range?: [number, number];
}

interface BlockStatementNode {
    type: 'BlockStatement';
    body: Rule.Node[];
    range?: [number, number];
}

interface IdentifierCallee {
    type: 'Identifier';
    name: string;
}

interface FunctionNode {
    type: 'ArrowFunctionExpression' | 'FunctionExpression';
    body: Rule.Node;
}

interface NodeWithRange {
    range?: [number, number];
}

const isCommentNode = (node: unknown): node is CommentNode =>
    typeof node === 'object' &&
    node !== null &&
    'value' in node &&
    typeof (node as CommentNode).value === 'string';

const isBlockStatement = (node: Rule.Node): node is Rule.Node & BlockStatementNode =>
    node.type === 'BlockStatement' &&
    'body' in node &&
    Array.isArray((node as unknown as BlockStatementNode).body);

const isIdentifierCallee = (node: unknown): node is IdentifierCallee =>
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as IdentifierCallee).type === 'Identifier' &&
    'name' in node &&
    typeof (node as IdentifierCallee).name === 'string';

const isFunctionNode = (node: unknown): node is FunctionNode =>
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    ((node as FunctionNode).type === 'ArrowFunctionExpression' || (node as FunctionNode).type === 'FunctionExpression') &&
    'body' in node;

const hasRange = (node: unknown): node is NodeWithRange =>
    typeof node === 'object' &&
    node !== null &&
    'range' in node &&
    Array.isArray((node as NodeWithRange).range);

const aaaPatternRule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce AAA (Arrange, Act, Assert) comments in tests',
            recommended: true,
        },
        messages: {
            missingAct: 'Test is missing "// Act" or "// Act & Assert" comment',
            missingAssert: 'Test is missing "// Assert" comment (or use "// Act & Assert")',
            missingArrange: 'Test has code before "// Act" but is missing "// Arrange" comment',
        },
        schema: [],
    },
    create(context) {
        const testFunctionNames = ['it', 'test'];

        const getCommentPositions = (comments: CommentNode[]): { arrange: number; act: number; assert: number; actAndAssert: number } => {
            const positions = { arrange: -1, act: -1, assert: -1, actAndAssert: -1 };

            for (const comment of comments) {
                const pos = comment.range?.[0] ?? -1;
                if (/^\s*Act\s*&\s*Assert\s*$/i.test(comment.value)) {
                    positions.actAndAssert = pos;
                } else if (/^\s*Arrange\s*$/i.test(comment.value)) {
                    positions.arrange = pos;
                } else if (/^\s*Act\s*$/i.test(comment.value)) {
                    positions.act = pos;
                } else if (/^\s*Assert\s*$/i.test(comment.value)) {
                    positions.assert = pos;
                }
            }

            return positions;
        };

        const checkTestFunction = (node: Rule.Node, callbackBody: Rule.Node): void => {
            if (!isBlockStatement(callbackBody)) return;

            const bodyRange = hasRange(callbackBody) ? callbackBody.range : undefined;
            const sourceCode = context.sourceCode ?? context.getSourceCode();
            const comments = sourceCode.getAllComments().filter((comment): comment is typeof comment & CommentNode => {
                if (!isCommentNode(comment)) return false;
                const commentRange = comment.range;
                if (!commentRange || !bodyRange) return false;
                return commentRange[0] >= bodyRange[0] && commentRange[1] <= bodyRange[1];
            });

            const positions = getCommentPositions(comments);
            const hasActAndAssert = positions.actAndAssert !== -1;
            const hasAct = positions.act !== -1 || hasActAndAssert;
            const hasAssert = positions.assert !== -1 || hasActAndAssert;
            const hasArrange = positions.arrange !== -1;

            if (!hasAct) {
                context.report({ node, messageId: 'missingAct' });
                return;
            }

            if (!hasAssert) {
                context.report({ node, messageId: 'missingAssert' });
                return;
            }

            // Check if there's code before Act that needs Arrange comment
            if (!hasArrange && !hasActAndAssert) {
                const actPosition = positions.act;
                const firstStatement = callbackBody.body[0];
                if (firstStatement && hasRange(firstStatement)) {
                    const firstStatementRange = firstStatement.range;
                    if (firstStatementRange && firstStatementRange[0] < actPosition) {
                        context.report({ node, messageId: 'missingArrange' });
                    }
                }
            }
        };

        return {
            CallExpression(node) {
                if (!isIdentifierCallee(node.callee)) return;
                if (!testFunctionNames.includes(node.callee.name)) return;

                const callback = node.arguments[1];
                if (!callback || !isFunctionNode(callback)) return;

                checkTestFunction(node, callback.body);
            },
        };
    },
};

const plugin: ESLint.Plugin = {
    meta: {
        name: 'eslint-plugin-aaa-pattern',
        version: '1.0.0',
    },
    rules: {
        'enforce-comments': aaaPatternRule,
    },
};

export default plugin;
