import matplotlib.pyplot as plt
import numpy as np

# Define the bag composition
# Format: (skill_required, num_successes, count)
bag = [
    # S1 tokens
    (1, 0, 5),
    (1, 1, 4), (1, 2, 3), (1, 3, 1),
    # S2 tokens
    (2, 1, 2), (2, 2, 1), (2, 3, 1),
    # S3 tokens
    (3, 1, 1), (3, 2, 2), (3, 3, 1),
    # S4 tokens
    (4, 1, 2), (4, 2, 2), (4, 3, 1),
    # S5 tokens
    (5, 1, 1), (5, 2, 2), (5, 3, 1),
]

# Calculate total tokens
total_tokens = sum(count for _, _, count in bag)
print(f"Total tokens in bag: {total_tokens}")

# Calculate probabilities for each skill level (1-5) and desired result (0-4)
skill_levels = range(1, 6)
result_levels = range(0, 5)

# Store cumulative probabilities
# cumulative_probs[skill][result] = P(getting result or better | skill level)
cumulative_probs = {}

for skill in skill_levels:
    # For each skill level, determine what result each token gives
    token_results = []
    for skill_required, num_successes, count in bag:
        if skill >= skill_required:
            # Player meets requirement, gets the successes
            result = num_successes
        else:
            # Player doesn't meet requirement, gets 0
            result = 0
        token_results.extend([result] * count)

    # Calculate cumulative probabilities for this skill level
    cumulative_probs[skill] = {}
    for target_result in result_levels:
        # Count tokens that give target_result or better
        successful_tokens = sum(1 for r in token_results if r >= target_result)
        cumulative_probs[skill][target_result] = successful_tokens / total_tokens

# Print the probability table
print("\nCumulative Probability Table (P(N or better)):")
print("Skill |", end="")
for result in result_levels:
    print(f"  N≥{result}  |", end="")
print()
print("-" * 50)
for skill in skill_levels:
    print(f"  {skill}   |", end="")
    for result in result_levels:
        prob = cumulative_probs[skill][result]
        print(f" {prob:5.1%} |", end="")
    print()

# Create the plot
fig, ax = plt.subplots(figsize=(12, 8))

# Plot lines for each skill level
colors = plt.cm.viridis(np.linspace(0, 0.9, len(skill_levels)))
markers = ['o', 's', '^', 'd', 'v']

for idx, skill in enumerate(skill_levels):
    probs = [cumulative_probs[skill][result] * 100 for result in result_levels]
    ax.plot(result_levels, probs, marker=markers[idx], linewidth=2.5,
            markersize=8, label=f'Skill {skill}', color=colors[idx])

# Formatting
ax.set_xlabel('Minimum Number of Successes (N)', fontsize=12, fontweight='bold')
ax.set_ylabel('Cumulative Probability (%)', fontsize=12, fontweight='bold')
ax.set_title('Token Bag Randomness System:\nProbability of Obtaining N or More Successes by Skill Level',
             fontsize=14, fontweight='bold', pad=20)
ax.set_xticks(result_levels)
ax.set_xticklabels([f'{n}+' for n in result_levels])
ax.set_ylim(0, 105)
ax.set_yticks(range(0, 101, 10))
ax.grid(True, alpha=0.3, linestyle='--')
ax.legend(loc='upper right', fontsize=11, framealpha=0.9)

# Add horizontal reference lines
for y in [25, 50, 75]:
    ax.axhline(y=y, color='gray', linestyle=':', alpha=0.4, linewidth=0.8)

plt.tight_layout()
plt.savefig('/mnt/user-data/outputs/token_bag_probabilities.png', dpi=300, bbox_inches='tight')
print("\nPlot saved successfully!")

# Additional analysis: Expected values
print("\n\nExpected Number of Successes by Skill Level:")
for skill in skill_levels:
    token_results = []
    for skill_required, num_successes, count in bag:
        result = num_successes if skill >= skill_required else 0
        token_results.extend([result] * count)
    expected = sum(token_results) / len(token_results)
    print(f"Skill {skill}: {expected:.3f} successes")