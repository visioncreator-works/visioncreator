<script lang="ts">
	import '../app.postcss';
	import { Drawer, AppShell, initializeStores, getDrawerStore } from '@skeletonlabs/skeleton';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import type { LayoutData } from './$types';
	import { invalidate } from '$app/navigation';
	import { client } from '$lib/wundergraph';
	import { Auth } from '@supabase/auth-ui-svelte';
	import { vcAuthTheme } from '$lib/themes/vcAuthTheme';
	import * as vcAuthLocalization from '$lib/themes/vcAuthLocalization.json';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';

	let authReady = writable(false);

	export let data: LayoutData;

	initializeStores();
	const drawerStore = getDrawerStore();

	let { supabase, session, queryClient, url } = data;
	$: ({ supabase, session, queryClient, url } = data);

	onMount(() => {
		drawerStore.subscribe((state) => {
			if (state.open && browser) {
				setTimeout(() => {
					authReady.set(true);
				}, 100);
				authReady.set(false);
			}
		});
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		return () => data.subscription.unsubscribe();
	});

	$: if (session?.access_token) {
		client.setAuthorizationToken(session.access_token);
	}
</script>

<QueryClientProvider client={queryClient}>
	<Drawer height="h-auto">
		<div class="@container">
			{#if $drawerStore.meta}
				<ComposeView view={$drawerStore.meta} />
			{:else}
				<div class="max-w-xl mx-auto @3xl:my-16 p-6 max-h-full">
					<div
						class="flex flex-col items-center justify-center p-6 text-center shadow-md bg-surface-700 rounded-3xl"
					>
						<div class="h2 text-xl font-bold mb-2.5 @3xl:text-3xl">Newsletter</div>
						<p class="max-w-2xl text-md @3xl:text-lg">
							Erfahre wöchentliche Updates, wie wir uns entwickeln und wo du auf deiner Warteliste
							stehst, bis du von uns Eingeladen wirst.
						</p>
					</div>
					{#if $authReady}
						<Auth
							supabaseClient={supabase}
							view="magic_link"
							redirectTo={`${url}/auth/callback`}
							showLinks={false}
							theme="dark"
							appearance={{
								theme: vcAuthTheme
							}}
							localization={{
								variables: vcAuthLocalization
							}}
						/>{/if}
				</div>
			{/if}
		</div>
	</Drawer>

	<AppShell>
		<slot />
	</AppShell>
</QueryClientProvider>

{#if !session}
	<footer class="fixed inset-x-0 bottom-0 p-4 text-xs text-center text-white">
		<button
			on:click={() =>
				drawerStore.open({
					position: 'bottom'
				})}
			class="mx-2">Login</button
		>
		<a href="/data-privacy" class="mx-2">Datenschutz</a>
		<a href="/terms-of-service" class="mx-2">AGB</a>
		<a href="/imprint" class="mx-2">Impressum</a>
	</footer>
{/if}
