<script lang="ts">
	import { createMutation } from '$lib/wundergraph';
	export let me;

	let query = $me.query;
	let selectedItem = null;

	const insertDBMutation = createMutation({
		operationName: 'insertDB'
	});

	function isFieldRequired(key: string, schema: any) {
		return schema.required && schema.required.includes(key);
	}
	function sortByTimestamp(a, b) {
		return new Date(b.json.timestamp).getTime() - new Date(a.json.timestamp).getTime();
	}

	async function generateRandomObject() {
		const result = await $insertDBMutation.mutateAsync({});
		if (result.success) {
			await $query.refetch();
		} else {
			console.error('Failed to generate random object:', result.error);
		}
	}

	function truncateCID(url: string) {
		const cid = url.split('/').pop() || '';
		return cid.length > 16 ? `${cid.slice(0, 20)}...` : cid;
	}

	function renderProperties(properties: any, required: string[] = []) {
		return Object.entries(properties).map(([key, value]) => ({
			key,
			value,
			isObj: typeof value === 'object' && value !== null && value.type === 'object',
			isRequired: required.includes(key)
		}));
	}

	let expandedProperties: Record<string, boolean> = {};

	function toggleProperty(key: string) {
		expandedProperties[key] = !expandedProperties[key];
		expandedProperties = { ...expandedProperties };
	}

	function getPropertyDescription(key: string, schema: any) {
		if (schema.properties && schema.properties[key] && schema.properties[key].description) {
			return schema.properties[key].description;
		}
		return '';
	}
</script>

<div class="flex h-full text-gray-900 bg-tertiary-100 dark:bg-surface-900 dark:text-white">
	<!-- Left side: List view -->
	<div class="w-[300px] p-4 overflow-y-auto border-r border-surface-300-600-token">
		<button
			on:click={generateRandomObject}
			class="w-full px-4 py-2 mb-4 text-white bg-blue-500 rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
		>
			Generate Random Object
		</button>

		{#if query}
			<ul class="space-y-4">
				{#each $query.data.db.sort(sortByTimestamp) as item}
					<li
						class="p-4 cursor-pointer card variant-filled-tertiary-200 dark:variant-filled-surface-900 hover:bg-tertiary-300 dark:hover:bg-surface-800"
						on:click={() => (selectedItem = item)}
					>
						<h3 class="mb-2 text-lg font-semibold truncate">{item.json.title}</h3>
						<p class="mb-1 text-sm truncate">{item.json.description}</p>
						<p class="text-xs truncate">Author: {item.json.author}</p>
						<p class="text-xs">Version: {item.json.version}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Right side: Detail view -->
	<div class="flex-1 p-4 overflow-y-auto">
		{#if selectedItem}
			<h2 class="mb-4 text-2xl font-bold">{selectedItem.json.title}</h2>
			<div class="flex">
				<!-- First column: normal props -->
				<div class="flex flex-col max-w-xs p-4 border-r border-surface-300-600-token">
					<h3 class="mb-2 text-lg font-semibold">Metainfo</h3>
					{#each Object.entries(selectedItem.json) as [key, value]}
						{#if key !== 'properties'}
							<div class="flex flex-col mb-2">
								<div class="flex items-center">
									<span
										class="px-1 text-white rounded-sm text-2xs bg-surface-700 dark:bg-surface-600"
									>
										{Array.isArray(value)
											? 'array'
											: typeof value === 'object' && value !== null
											? 'object'
											: typeof value}
									</span>
									<span class="ml-1 text-sm font-semibold text-surface-700 dark:text-surface-300">
										{key}
									</span>
									{#if isFieldRequired(key, selectedItem.json)}
										<span class="px-1 ml-1 text-red-500 border border-red-500 rounded text-2xs"
											>*</span
										>
									{/if}
								</div>
								{#if getPropertyDescription(key, selectedItem.json)}
									<span class="text-xs text-surface-600 dark:text-surface-400">
										{getPropertyDescription(key, selectedItem.json)}
									</span>
								{/if}
								{#if typeof value !== 'object' || value === null}
									<span class="text-xs truncate text-surface-900 dark:text-white">
										{['$id', '$schema'].includes(key) ? truncateCID(value) : value}
									</span>
								{/if}
							</div>
						{/if}
					{/each}
				</div>

				<!-- Second column: properties -->
				<div class="flex flex-col max-w-xs p-4 border-r border-surface-300-600-token">
					<h3 class="mb-2 text-lg font-semibold">Properties</h3>
					{#each renderProperties(selectedItem.json.properties, selectedItem.json.required || []) as prop}
						<div class="flex flex-col mb-2">
							<div class="flex items-center">
								<span
									class="px-1 text-white rounded-sm text-2xs bg-surface-700 dark:bg-surface-600"
								>
									{prop.isObj ? 'object' : prop.value.type}
								</span>
								<span
									class="ml-1 text-sm font-semibold truncate text-surface-700 dark:text-surface-300"
								>
									{prop.key}
								</span>
								{#if prop.isRequired}
									<span class="px-1 ml-1 text-red-500 border border-red-500 rounded text-2xs"
										>*</span
									>
								{/if}
								{#if prop.isObj}
									<button
										class="ml-1 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
										on:click={() => toggleProperty(prop.key)}
									>
										{expandedProperties[prop.key] ? '▼' : '▶'}
									</button>
								{/if}
							</div>
							<span class="text-xs truncate text-surface-600 dark:text-surface-400">
								{prop.value.description}
							</span>
						</div>
					{/each}
				</div>

				<!-- Third column: sub-properties -->
				{#if Object.values(expandedProperties).some(Boolean)}
					<div class="flex flex-col max-w-xs p-4 border-l border-surface-300-600-token">
						{#each renderProperties(selectedItem.json.properties, selectedItem.json.required || []) as prop}
							{#if prop.isObj && expandedProperties[prop.key]}
								<h4 class="mb-2 font-semibold truncate text-md">{prop.key} Properties</h4>
								{#each renderProperties(prop.value.properties, prop.value.required || []) as subProp}
									<div class="flex flex-col mb-2">
										<div class="flex items-center">
											<span
												class="px-1 text-white rounded-sm text-2xs bg-surface-700 dark:bg-surface-600"
											>
												{subProp.isObj ? 'object' : subProp.value.type}
											</span>
											<span
												class="ml-1 text-sm font-semibold truncate text-surface-700 dark:text-surface-300"
											>
												{subProp.key}
											</span>
											{#if subProp.isRequired}
												<span class="px-1 ml-1 text-red-500 border border-red-500 rounded text-2xs"
													>*</span
												>
											{/if}
										</div>
										<span class="text-xs truncate text-surface-600 dark:text-surface-400">
											{subProp.value.description}
										</span>
									</div>
								{/each}
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<p class="text-xl text-center">Select an item from the list to view details</p>
		{/if}
	</div>
</div>