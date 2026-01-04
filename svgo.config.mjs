export default {
	multipass: true,
	plugins: [
		{
			name: 'removeViewBox',
			active: false
		},
		'removeXMLProcInst',
		'cleanupAttrs',
		'removeDoctype',
		'removeDimensions',
		'removeComments',
		'removeMetadata',
		'removeTitle',
		'removeDesc'
	]
};
