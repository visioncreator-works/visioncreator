<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { onMount, afterUpdate } from 'svelte';
	import { page } from '$app/stores';
	import { futureMe } from '$lib/stores';

	const drawerStore = getDrawerStore();

	let typingSound, backgroundMusic;
	if (typeof window !== 'undefined') {
		typingSound = new Audio('typing.mp3');
		backgroundMusic = new Audio('inthenameoflove.mp3');
	}

	let currentParagraph = 0;
	let centeredText = '';
	let isStarted = false;
	let typeWriter;

	let isMuted = false;

	$: {
		const urlParams = $page.url.searchParams;
		const urlVisionId = urlParams.get('visionid');

		if (typeof window !== 'undefined' && urlVisionId) {
			futureMe.update((current) => ({
				...current,
				visionid: urlVisionId
			}));
		}
	}

	let paragraphs = [
		'21. März 2031 - Uhrzeit - 23:21',
		'Liebes Tagebuch, heute strahlen und blitzen meine Augen vor Freude.',
		'Ich führe ein Leben, indem ich Tag täglich entscheiden kann',
		'in welche sinnstiftende Arbeit ich meine wertvolle Lebenszeit investiere.',
		'Ich bin so froh das ich das alte und verstaubte Konzept',
		'Zeit gegen Geld zu tauschen abgelegt habe und ich jetzt',
		'über 25 verschiedene Einkommensquellen habe, die mich und meine Familie',
		'ein ereignisreiches und gutes Leben führen lassen',
		'Ich bin dankbar und glücklich darüber, dass ich 2024 Visioncreator geworden bin.',
		'Es ist eine geile Community und wir haben viel Spaß zusammen.',
		'Jeder von uns investiert jeden Tag 1€ in sich selbst',
		'und damit in gesellschaftsbewegende Großvisionen an denen wir alle beteiligt sind',
		'Wir haben es geschafft jeden Monat ein Community-Startup',
		'aus unserer Mitte heraus zu finanzieren und so das Leben ',
		'auf unserem Planeten Tag für Tag für jeden Menschen immer lebenswerter zu machen',
		'Heute ist ein besonderer Tag. In einer Stunde ist es so weit',
		'dass wir zum ersten mal eine Vision mit 10 Million € finanzieren werden',
		'Einfach unglaublich und faszinierend zugleich, dass wir das heute schaffen.',
		'Ich habe richtig Gänsehaut und kann es kaum erwarten',
		'draußen schießen schon die Feuerwerks-Raketen',
		'und ich werde mich jetzt ins Partygetümmel schmeißen',
		'Danke das ich damals an mich geglaubt habe',
		'und mich dazu entschieden habe Visioncreator zu sein',
		'In tiefer Dankbarkeit dein Visioncreator xyz'
	];
	let state = 1;

	let firstSentence = paragraphs[0]; // Store the first sentence
	let firstSentenceDisplayed = ''; // To hold the typed out first sentence
	let isFirstSentenceComplete = false;

	const next = () => {
		if (state === 1) {
			state = 2;
		} else if (state === 2) {
			state = 3;
			// No need to manually update localStorage, it's handled by the store
		} else if (state === 3) {
			state = 4;
			start();
		}
	};

	const start = () => {
		isStarted = true;
		backgroundMusic.play();
		typeWriter();
	};

	const toggleMute = () => {
		isMuted = !isMuted;
		typingSound.muted = isMuted;
		backgroundMusic.muted = isMuted;
	};

	if (typeof window !== 'undefined') {
		typeWriter = async () => {
			if (!isStarted) return;
			let text;
			if (currentParagraph === 0 && !isFirstSentenceComplete) {
				text = firstSentence.replace('xyz', $futureMe.name);
			} else {
				text = paragraphs[currentParagraph].replace('xyz', $futureMe.name);
			}

			for (let i = 0; i < text.length; i++) {
				if (currentParagraph === 0) {
					firstSentenceDisplayed = text.substring(0, i + 1);
				} else {
					centeredText = text.substring(0, i + 1);
				}
				typingSound.play();
				await new Promise((resolve) => setTimeout(resolve, 65));
			}
			typingSound.pause();
			typingSound.currentTime = 0;

			if (currentParagraph === 0) {
				isFirstSentenceComplete = true; // Mark the first sentence as complete
			}

			if (currentParagraph < paragraphs.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, 1500));
				centeredText = '';
				currentParagraph = (currentParagraph + 1) % paragraphs.length;
				typeWriter();
			}
		};
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			typeWriter();
		}
	});

	afterUpdate(() => {
		const centeredTextElement = document.querySelector('.centered-text');
		if (centeredTextElement) {
			centeredTextElement.textContent = centeredText;
		}
	});
</script>

<div class="video-container">
	<video autoplay loop muted playsinline class="background-video">
		<source src="wald.mp4" type="video/mp4" />
	</video>

	<div class="h-full overlay">
		<div class="@container h-full">
			<div
				class="min-h-full flex flex-col justify-end text-center items-center mx-auto max-w-xl @4xl:max-w-6xl p-2 gap-4 pb-12 @3xl:pb-16"
			>
				{#if state === 1}
					<div class="w-32 @3xl:w-48 opacity-70">
						<img src="logo.png" alt="visioncreator" />
					</div>
					<h1
						class="h1 text-4xl @md:text-5xl @4xl:text-6xl @5xl:text-7xl @6xl:text-8xl @7xl:text-9xl"
					>
						Es ist an der Zeit...
					</h1>
					<div class="text-sm @md:text-lg @4xl:text-xl @5xl:text-2xl">
						...mein volles Lebenspotenzial zu entfalten und jeden Tag mit einem Strahlen und Lächeln
						durchs Leben zu gehen.
					</div>
					<div class="text-2xl @4xl:text-3xl @5xl:text-4xl @6xl:text-5xl font-normal mb-4">
						Jetzt oder nie!
					</div>
					<button
						type="button"
						class="btn bg-gradient-to-br variant-gradient-secondary-primary btn-md @3xl:btn-lg"
						on:click={next}>Ich bin bereit</button
					>
				{:else if state === 2}
					<input
						bind:value={$futureMe.name}
						placeholder="Mein Name ist?"
						style="background: rgba(255, 255, 255, 0.2); padding: 0.5rem 1rem; font-size: 1.6rem; color: white; border: 1px solid white; border-radius: 2rem; outline: none;"
					/>
					<button
						type="button"
						class="btn bg-gradient-to-br variant-gradient-secondary-primary btn-md @3xl:btn-lg"
						on:click={next}>Lass mich träumen</button
					>
				{:else if state === 3}
					<h2
						class="h2 mb-2 text-4xl @md:text-5xl @4xl:text-6xl @5xl:text-7xl @6xl:text-8xl @7xl:text-9xl text-white"
					>
						Schön das du da bist {$futureMe.name}!
					</h2>
					<p class="mb-4 text-sm @md:text-lg @4xl:text-xl @5xl:text-2xl">
						Lass uns in deine Zukunft schauen und in dein neues Leben eintauchen
					</p>
					<button
						type="button"
						class="btn bg-gradient-to-br variant-gradient-secondary-primary btn-md @3xl:btn-lg"
						on:click={next}
					>
						<span>Starte Video</span>
						<span><Icon icon="icon-park-solid:play" class="w-6 h-6 @3xl:w-7 @3xl:h-7" /></span>
					</button>
				{:else}
					<h2
						class="h2 text-2xl fixed transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 h-48 @md:text-3xl @2xl:text-4xl @4xl:text-5xl @5xl:text-6xl leading-relaxed w-4/5 md:w-9/10 max-w-full"
					>
						{firstSentenceDisplayed}
					</h2>
					<p
						class="fixed transform -translate-x-1/2 -translate-y-1/2 top-2/3 left-1/2 h-48 text-lg @md:text-xl @2xl:text-2xl @4xl:text-3xl @5xl:text-4xl leading-relaxed w-4/5 md:w-9/10 max-w-full"
					>
						{centeredText}
					</p>
					<button
						class="flex flex-col items-center justify-center w-full h-auto p-4 text-tertiary-600"
						on:click={toggleMute}
						style="background: transparent; border: none; cursor: pointer; z-index: 1000; outline: none;"
						on:focus={{ outline: 'none' }}
					>
						{#if isMuted}
							<Icon icon="ion:volume-high-outline" class="w-10 h-10 @3xl:w-14 @3xl:h-14" />
							<span class="text-sm mt-1 @3xl:text-base">play sound</span>
						{:else}
							<Icon icon="ion:volume-mute-outline" class="w-10 h-10 @3xl:w-14 @3xl:h-14" />
							<span class="text-sm mt-1 @3xl:text-base">mute</span>
						{/if}
					</button>
					<button
						type="button"
						class="btn bg-gradient-to-br variant-gradient-secondary-primary btn-md @3xl:btn-lg"
						on:click={() =>
							drawerStore.open({
								position: 'bottom'
							})}>Jetzt auf Warteliste setzen</button
					>
				{/if}
			</div>
		</div>
	</div>

	<!-- <div class="absolute w-full text-white bottom-10">
		<div class="flex justify-around w-full">
			<div class="text-center">
				<p class="text-4xl">1</p>
				<p class="text-xs text-gray-300">Vision entwickelt</p>
			</div>
			<div class="text-center">
				<p class="text-4xl">845€</p>
				<p class="text-xs text-gray-300">Monatlicher Projektpool</p>
			</div>
			<div class="text-center">
				<p class="text-4xl">2.024€</p>
				<p class="text-xs text-gray-300">Gesamt finanziert</p>
			</div>
		</div>
	</div> -->
</div>

<style>
	input::placeholder {
		color: #d1d5db;
	}

	.video-container {
		position: relative;
		width: 100%;
		height: 100%; /* Full viewport height */
		overflow: hidden; /* No scrolling */
		padding: 0;
		margin: 0;
	}

	.background-video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover; /* Cover the full area without stretching */
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(to top, rgba(24, 25, 73, 0.842), rgba(230, 209, 74, 0.142));
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
</style>
