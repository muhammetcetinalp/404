package com.backend.delivery_backend.config;

import com.backend.delivery_backend.DTO.UserDTO;
import com.backend.delivery_backend.ENUM.DeliveryType;
import com.backend.delivery_backend.model.Admin;
import com.backend.delivery_backend.model.Customer;
import com.backend.delivery_backend.model.MenuItem;
import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.model.User;
import com.backend.delivery_backend.repository.AdminRepository;
import com.backend.delivery_backend.repository.MenuItemRepository;
import com.backend.delivery_backend.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserDetailsServiceImpl userService;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Override
    public void run(String... args) throws Exception {
        if (adminRepository.count() == 0) {
            System.out.println("Data Seeder: Database is empty. Seeding initial data...");

            // Seed Admin
            UserDTO adminDto = new UserDTO();
            adminDto.setName("System Admin");
            adminDto.setEmail("admin");
            adminDto.setPassword("admin");
            adminDto.setPhone("5550000000");
            adminDto.setRole("admin");
            userService.save(adminDto);

            // Seed Customer
            UserDTO customerDto = new UserDTO();
            customerDto.setName("Test Customer");
            customerDto.setEmail("user1");
            customerDto.setPassword("user1");
            customerDto.setPhone("5550000001");
            customerDto.setRole("customer");
            customerDto.setCity("Ankara");
            customerDto.setDistrict("Çankaya");
            customerDto.setAddress("Customer Adresi No: 1");
            userService.save(customerDto);

            // Seed Courier
            UserDTO courierDto = new UserDTO();
            courierDto.setName("Test Courier");
            courierDto.setEmail("courier1");
            courierDto.setPassword("courier1");
            courierDto.setPhone("5550000002");
            courierDto.setRole("courier");
            userService.save(courierDto);

            // Seed 10 Restaurants and Menus
            seedRestaurantsAndMenus();

            System.out.println("Data Seeder: Initial data seeded successfully.");
        } else {
            System.out.println("Data Seeder: Database already contains data. Skipping seeding.");
        }
    }

    private void seedRestaurantsAndMenus() {
        String[][] restaurantData = {
                {"Pizza Place", "pizza@demo.com", "Italian", "10:00", "23:00"},
                {"Burger Joint", "burger@demo.com", "American", "11:00", "22:00"},
                {"Sushi Bar", "sushi@demo.com", "Japanese", "12:00", "23:00"},
                {"Taco Truck", "taco@demo.com", "Mexican", "10:00", "24:00"},
                {"Kebapçı", "kebap@demo.com", "Turkish", "09:00", "23:59"},
                {"Vegan Cafe", "vegan@demo.com", "Healthy", "08:00", "20:00"},
                {"Curry House", "curry@demo.com", "Indian", "12:00", "23:00"},
                {"Noodle Bowl", "noodle@demo.com", "Chinese", "11:00", "22:00"},
                {"Steakhouse", "steak@demo.com", "American", "16:00", "23:30"},
                {"Breakfast Diner", "diner@demo.com", "American", "06:00", "15:00"}
        };

        for (int i = 0; i < restaurantData.length; i++) {
            UserDTO restDto = new UserDTO();
            restDto.setName(restaurantData[i][0]);
            restDto.setEmail(restaurantData[i][1]);
            restDto.setPassword("pass" + (i + 1));
            restDto.setPhone("55510000" + String.format("%02d", i));
            restDto.setRole("restaurant_owner");
            restDto.setCity("Istanbul");
            restDto.setDistrict("Kadikoy");
            restDto.setAddress("Restaurant No: " + (i + 1));
            restDto.setBusinessHoursStart(restaurantData[i][3]);
            restDto.setBusinessHoursEnd(restaurantData[i][4]);
            restDto.setCuisineType(restaurantData[i][2]);
            restDto.setDeliveryType("BOTH");

            User user = userService.save(restDto);
            
            if (user instanceof RestaurantOwner owner) {
                // Manually set as open, active and approved for seeding convenience
                owner.setAccountStatus("ACTIVE");
                owner.setApproved(true);
                owner.setOpen(true);
                owner.setRating(4.5f);
                userService.saveUser(owner);
                
                // Add Menus
                seedMenusForRestaurant(owner, restaurantData[i][2]);
            }
        }
    }

    private void seedMenusForRestaurant(RestaurantOwner owner, String cuisine) {
        String[][] menuItems;

        switch (cuisine) {
            case "Italian":
                menuItems = new String[][]{
                        {"Margherita Pizza", "Classic cheese and tomato", "120.0"},
                        {"Pepperoni Pizza", "Spicy pepperoni slice", "150.0"},
                        {"Pasta Carbonara", "Creamy egg and pancetta sauce", "135.0"}
                };
                break;
            case "American":
                menuItems = new String[][]{
                        {"Cheeseburger", "Beef patty with cheddar", "110.0"},
                        {"French Fries", "Crispy golden potatoes", "50.0"},
                        {"Milkshake", "Vanilla or Chocolate", "60.0"}
                };
                break;
            case "Japanese":
                menuItems = new String[][]{
                        {"California Roll", "Crab, avocado, cucumber", "140.0"},
                        {"Spicy Tuna", "Tuna with spicy mayo", "160.0"},
                        {"Miso Soup", "Traditional tofu soup", "40.0"}
                };
                break;
            case "Turkish":
                menuItems = new String[][]{
                        {"Adana Kebab", "Spicy minced meat skewer", "180.0"},
                        {"Lahmacun", "Turkish pizza with minced meat", "50.0"},
                        {"Ayran", "Yogurt drink", "20.0"}
                };
                break;
            case "Mexican":
                menuItems = new String[][]{
                        {"Beef Tacos", "3 crispy beef tacos", "130.0"},
                        {"Chicken Burrito", "Large chicken wrap", "145.0"},
                        {"Nachos", "Cheese and jalapeno nachos", "90.0"}
                };
                break;
            case "Indian":
                menuItems = new String[][]{
                        {"Chicken Tikka Masala", "Creamy tomato curry", "170.0"},
                        {"Garlic Naan", "Indian flatbread", "35.0"},
                        {"Samosa", "Potato and pea pastry", "45.0"}
                };
                break;
            case "Chinese":
                menuItems = new String[][]{
                        {"Kung Pao Chicken", "Spicy stir-fried chicken", "155.0"},
                        {"Fried Rice", "Egg and vegetable fried rice", "90.0"},
                        {"Spring Rolls", "3 vegetable spring rolls", "60.0"}
                };
                break;
            default:
                menuItems = new String[][]{
                        {"House Salad", "Fresh greens and vinaigrette", "80.0"},
                        {"Soup of the Day", "Chef's special", "65.0"},
                        {"Sandwich", "Turkey and cheese", "95.0"}
                };
                break;
        }

        for (String[] item : menuItems) {
            MenuItem menuItem = new MenuItem();
            menuItem.setName(item[0]);
            menuItem.setDescription(item[1]);
            menuItem.setPrice(Double.parseDouble(item[2]));
            menuItem.setAvailable(true);
            menuItem.setRestaurant(owner);
            menuItemRepository.save(menuItem);
        }
    }
}
