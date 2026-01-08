import { stats, type Stat, type StatType } from './stats';

export type StatOperator = '+' | '-' | '*' | '/';

export type StatExpressionNode =
	| Stat
	| number
	| [StatExpressionNode, StatOperator, StatExpressionNode];

export type StatExpression = string | StatExpressionNode;

export const parseExpression = (x: string): StatExpressionNode => {
	const tokens = tokenizeExpression(x);

	const parse = (cursor: number): StatExpressionNode | undefined => {
		const token = tokens[cursor];
		const nextToken = cursor + 1 < tokens.length - 1 ? tokens[cursor + 1] : undefined;
		let node: StatExpressionNode | undefined = undefined;

		const number = Number(token);
		if (!isNaN(number)) {
			node = number;
		}

		if (token in stats) {
			node = stats[token as StatType];
		}

		if (node !== undefined && nextToken !== undefined) {
			const nextNode = parse(cursor + 2);
			if (nextNode !== undefined) {
				node = [node, nextToken as StatOperator, nextNode];
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

export const resolveExpression = (node: StatExpression): StatExpressionNode =>
	typeof node === 'string' ? parseExpression(node) : node;

export function tokenizeExpression(x: string): string[] {
	const re = /([+\-*/])/g;
	return x.split(re).filter((part) => part !== '');
}
