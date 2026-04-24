from models.signal import MarketSignal, DebateResult


class Display:
    
    RESET = "\033[0m"
    BOLD = "\033[1m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    BG_DARK = "\033[40m"
    
    def header(self, title: str):
        width = 60
        print("\n" + "═" * width)
        print(f"{self.BOLD}{self.CYAN}{'  ' + title:^60}{self.RESET}")
        print("═" * width)
    
    def section(self, title: str):
        print(f"\n{self.BOLD}{self.WHITE}{'─' * 60}{self.RESET}")
        print(f"{self.BOLD}{self.YELLOW}  {title}{self.RESET}")
        print(f"{self.BOLD}{self.WHITE}{'─' * 60}{self.RESET}")
    
    def round_header(self, round_num: int):
        print(f"\n{self.BOLD}{self.BLUE}  ◆ ROUND {round_num}{self.RESET}")
    
    def signal_card(self, signal: MarketSignal):
        print(f"\n{self.BOLD}  📌 {signal.title}{self.RESET}")
        print(f"  Type: {signal.signal_type.value}")
        print(f"  Region: {signal.region}")
        print(f"\n  {signal.description}")
    
    def recommendation_card(self, result: DebateResult):
        
        # Color based on recommendation
        rec_colors = {
            "BUILD": self.GREEN,
            "INVEST": self.YELLOW,
            "MONITOR": self.BLUE,
            "IGNORE": self.RED
        }
        
        rec_upper = (result.recommendation or "").upper()
        color = self.GREEN  # default
        for key, val in rec_colors.items():
            if key in rec_upper:
                color = val
                break
        
        width = 60
        print("\n" + "╔" + "═" * (width-2) + "╗")
        print("║" + f"{self.BOLD}{self.CYAN}  FINAL RECOMMENDATION{self.RESET}".center(width+9) + "║")
        print("╠" + "═" * (width-2) + "╣")
        
        # Recommendation
        rec_display = f"  {result.recommendation}"
        print("║" + f"{self.BOLD}{color}{rec_display}{self.RESET}".ljust(width+9) + "║")
        
        # Confidence
        conf = result.confidence_score or 0
        bar = "█" * conf + "░" * (10 - conf)
        print("║" + f"  Confidence: {bar} {conf}/10".ljust(width-2) + "║")
        
        print("╠" + "═" * (width-2) + "╣")
        
        # Reasoning
        if result.reasoning:
            print("║" + f"  {self.BOLD}REASONING:{self.RESET}".ljust(width+9) + "║")
            # Word wrap reasoning
            words = result.reasoning.split()
            line = "  "
            for word in words:
                if len(line) + len(word) > width - 4:
                    print("║" + line.ljust(width-2) + "║")
                    line = "  " + word + " "
                else:
                    line += word + " "
            if line.strip():
                print("║" + line.ljust(width-2) + "║")
        
        print("╠" + "═" * (width-2) + "╣")
        
        # Conflicts
        if result.conflicts:
            print("║" + f"  {self.BOLD}⚡ CONFLICTS:{self.RESET}".ljust(width+9) + "║")
            for conflict in result.conflicts[:2]:
                text = f"  • {conflict[:width-6]}"
                print("║" + text.ljust(width-2) + "║")
        
        # Agreements  
        if result.agreements:
            print("╠" + "═" * (width-2) + "╣")
            print("║" + f"  {self.BOLD}✅ AGREEMENTS:{self.RESET}".ljust(width+9) + "║")
            for agreement in result.agreements[:2]:
                text = f"  • {agreement[:width-6]}"
                print("║" + text.ljust(width-2) + "║")
        
        # Next Actions
        if result.next_actions:
            print("╠" + "═" * (width-2) + "╣")
            print("║" + f"  {self.BOLD}🚀 NEXT ACTIONS:{self.RESET}".ljust(width+9) + "║")
            for action in result.next_actions[:3]:
                text = f"  {action[:width-4]}"
                print("║" + text.ljust(width-2) + "║")
        
        print("╚" + "═" * (width-2) + "╝")
