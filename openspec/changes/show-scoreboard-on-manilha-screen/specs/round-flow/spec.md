## MODIFIED Requirements

### Requirement: Manilha Selection in Bid Phase

The system SHALL, at the start of the bid phase, require the user to select the manilha (value then suit) and keep the palpite (bid) inputs hidden until a manilha value has been selected. While the manilha is being selected, the system SHALL keep the lives panel (placar) visible below the manilha selector, listing every player in seating order with their remaining lives using the same color-coding as the rest of the round screen.

#### Scenario: Bids hidden before manilha
- **WHEN** the bid phase begins and no manilha is selected
- **THEN** the palpite inputs are not shown and only the manilha selector is visible

#### Scenario: Lives panel visible during manilha selection
- **WHEN** the bid phase begins and the manilha-selection sub-phase is shown
- **THEN** the manilha selector is shown at the top and the lives panel is visible below it, with every player in seating order and their remaining lives, color-coded and marking eliminated players, while the palpite inputs remain hidden

#### Scenario: Selecting the manilha
- **WHEN** the user selects a manilha value and suit
- **THEN** the selected manilha card is displayed and the flow proceeds toward bid entry
