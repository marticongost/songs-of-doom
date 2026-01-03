import glob from 'fast-glob';
import { readFile } from 'fs/promises';
import yaml from 'js-yaml';
import path from 'path';

const RECORD_METADATA = Symbol('RECORD_METADATA');

export interface RecordMetadata {
	id: string;
	path: Array<string>;
}

export interface CatalogRecord {
	[RECORD_METADATA]: RecordMetadata;
}

export const getCatalog = async <T extends CatalogRecord>(
	catalogName: string
): Promise<Array<T>> => {
	const catalogRoot = `${import.meta.dirname}/data/${catalogName}`;
	const catalogFiles = await glob(`${catalogRoot}/**/*.yaml`);
	const records: Array<T> = [];
	const recordLoaders = catalogFiles.map(async (fileName) => {
		const record = await loadYaml<T>(fileName);
		record[RECORD_METADATA] = {
			id: getRecordIdFromFileName(fileName),
			path: getRecordPath(catalogRoot, fileName)
		};
		records.push(record);
	});
	return Promise.all(recordLoaders).then(() => records);
};

export const getRecordMetadata = (record: CatalogRecord): RecordMetadata => {
	return record[RECORD_METADATA];
};

const loadYaml = async <T>(filePath: string): Promise<T> => {
	const fileContents = await readFile(filePath, 'utf-8');
	return yaml.load(fileContents) as T;
};

const getRecordIdFromFileName = (fileName: string): string => {
	const parts = fileName.split('/');
	const fileWithExtension = parts[parts.length - 1];
	return fileWithExtension.split('.')[0];
};

const getRecordPath = (catalogRoot: string, fileName: string): Array<string> => {
	const relativePath = path.relative(catalogRoot, fileName);
	const parts = relativePath.split(path.sep);
	parts.pop();
	return parts;
};
