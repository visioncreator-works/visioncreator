<script lang="ts">
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { createMutation } from '$lib/wundergraph';

	export let mandateId: string;
	export let templateId: string = 'BRT00007Y68WKQJ';

	let amount = 39.66;
	let name = 'VisionCreator Membership';
	let intervalUnit: 'weekly' | 'monthly' | 'yearly' = 'monthly';

	const createSubscriptionMutation = createMutation({
		operationName: 'CreateSubscription'
	});

	async function handleCreateSubscription() {
		await $createSubscriptionMutation.mutate({
			mandateId,
			templateId,
			amount: Math.round(amount * 100),
			name,
			intervalUnit
		});
	}
</script>

<div class="mt-4 space-y-3 rounded-token border border-surface-300-600-token p-4">
	<div>
		<h4 class="h4">Create subscription</h4>
		<p class="text-sm text-surface-600-300-token">
			Start a GoCardless subscription from the active mandate.
		</p>
	</div>

	<label class="label">
		<span>Subscription name</span>
		<input class="input" bind:value={name} placeholder="VisionCreator Membership" />
	</label>

	<div class="grid gap-3 md:grid-cols-2">
		<label class="label">
			<span>Amount</span>
			<input class="input" type="number" min="1" step="0.01" bind:value={amount} />
		</label>

		<label class="label">
			<span>Interval</span>
			<select class="select" bind:value={intervalUnit}>
				<option value="weekly">Weekly</option>
				<option value="monthly">Monthly</option>
				<option value="yearly">Yearly</option>
			</select>
		</label>
	</div>

	<button
		class="btn variant-filled-secondary"
		on:click={handleCreateSubscription}
		disabled={$createSubscriptionMutation.isLoading || !mandateId || amount <= 0 || !name.trim()}
	>
		{#if $createSubscriptionMutation.isLoading}
			<ProgressRadial width="w-6" />
		{:else}
			Create subscription
		{/if}
	</button>

	{#if $createSubscriptionMutation.error}
		<div class="alert variant-filled-error">
			<p>{$createSubscriptionMutation.error.message}</p>
		</div>
	{/if}

	{#if $createSubscriptionMutation.data?.success === false}
		<div class="alert variant-filled-error">
			<p>{$createSubscriptionMutation.data.message}</p>
		</div>
	{/if}

	{#if $createSubscriptionMutation.isSuccess && $createSubscriptionMutation.data?.success !== false}
		<div class="alert variant-filled-success">
			<p>Subscription created successfully.</p>
		</div>
	{/if}
</div>
