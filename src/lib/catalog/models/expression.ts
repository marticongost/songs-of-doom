import { stats, type Stat, type StatType } from './stats';

export type Operator = '+' | '-' | '*' | '/';

export type ExpressionNode = Stat | number | 'result' | [ExpressionNode, Operator, ExpressionNode];

export type Expression = string | ExpressionNode;

export const parseExpression = (x: string): ExpressionNode => {
	const tokens = tokenizeExpression(x);

	const parse = (cursor: number): ExpressionNode | undefined => {
		const token = tokens[cursor];
		const nextToken = cursor + 1 < tokens.length - 1 ? tokens[cursor + 1] : undefined;
		let node: ExpressionNode | undefined = undefined;

		const number = Number(token);
		if (!isNaN(number)) {
			node = number;
		}

		if (token === 'result') {
			node = 'result';
		} else if (token in stats) {
			node = stats[token as StatType];
		}

		if (node !== undefined && nextToken !== undefined) {
			const nextNode = parse(cursor + 2);
			if (nextNode !== undefined) {
				node = [node, nextToken as Operator, nextNode];
			} else {
				node = undefined;
			}
		}

		return node;
	};

	const node = parse(0);
	if (node === undefined) {
		throw new Error(`Invalid stat expression: ${x}`);
	}
	return node;
};

export const resolveExpression = (expr: Expression): ExpressionNode =>
	typeof expr === 'string' ? parseExpression(expr) : expr;

export const tokenizeExpression = (x: string): string[] => {
	const re = /([+\-*/])/g;
	return x.split(re).filter((part) => part !== '');
};
