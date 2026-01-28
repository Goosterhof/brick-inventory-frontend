import type { ESLint, Rule } from 'eslint';

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

        const getCommentPositions = (comments: Rule.Node[] | undefined): { arrange: number; act: number; assert: number; actAndAssert: number } => {
            const positions = { arrange: -1, act: -1, assert: -1, actAndAssert: -1 };
            if (!comments) return positions;

            comments.forEach((comment) => {
                const node = comment as unknown as { value: string; range?: [number, number] };
                const pos = node.range?.[0] ?? -1;
                if (/^\s*Act\s*&\s*Assert\s*$/i.test(node.value)) {
                    positions.actAndAssert = pos;
                } else if (/^\s*Arrange\s*$/i.test(node.value)) {
                    positions.arrange = pos;
                } else if (/^\s*Act\s*$/i.test(node.value)) {
                    positions.act = pos;
                } else if (/^\s*Assert\s*$/i.test(node.value)) {
                    positions.assert = pos;
                }
            });

            return positions;
        };

        const checkTestFunction = (node: Rule.Node, callbackBody: Rule.Node): void => {
            if (callbackBody.type !== 'BlockStatement') return;

            const body = callbackBody as unknown as { body: Rule.Node[]; range?: [number, number] };
            const sourceCode = context.sourceCode ?? context.getSourceCode();
            const comments = sourceCode.getAllComments().filter((comment) => {
                const commentRange = comment.range;
                const bodyRange = body.range;
                if (!commentRange || !bodyRange) return false;
                return commentRange[0] >= bodyRange[0] && commentRange[1] <= bodyRange[1];
            }) as unknown as Rule.Node[];

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
                const firstStatement = body.body[0];
                if (firstStatement) {
                    const firstStatementRange = (firstStatement as unknown as { range?: [number, number] }).range;
                    if (firstStatementRange && firstStatementRange[0] < actPosition) {
                        context.report({ node, messageId: 'missingArrange' });
                    }
                }
            }
        };

        return {
            CallExpression(node) {
                const callee = node.callee as unknown as { name?: string };
                if (!testFunctionNames.includes(callee.name ?? '')) return;

                const args = node.arguments as unknown as Rule.Node[];
                const callback = args[1];
                if (!callback) return;

                if (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression') {
                    const fn = callback as unknown as { body: Rule.Node };
                    checkTestFunction(node as unknown as Rule.Node, fn.body);
                }
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
